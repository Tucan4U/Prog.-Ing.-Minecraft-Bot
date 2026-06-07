const { Node } = require("../behaviorTree");
const { findInventoryItemByNames } = require("../../utils/inventory");

class LoadFurnaceNode extends Node {
  constructor(stateBlockKey = "blockTarget") {
    super("LoadFurnace");
    this.stateBlockKey = stateBlockKey;
  }

  // Vraća samo load/FSM stanje u početno stanje.
  resetLoadState(state) {
    state.furnaceLoadPhase = null;
    state.furnaceContainer = null;
    state.furnaceLoadDone = false;
    state.furnaceCurrentInputName = null;
    state.furnaceCurrentBatchCount = 0;
  }

  // Sigurno zatvara furnace container ako je još otvoren.
  async closeContainerIfOpen(state) {
    const furnace = state.furnaceContainer;
    if (!furnace) return;

    try {
      await furnace.close();
    } catch (e) {
      console.log("LOAD FURNACE -> Error occurred while closing furnace container.", e);
    }

    state.furnaceContainer = null;
  }

  // Vraća prvi preostali input iz active session queuea.
  getNextSelectedItem(state) {
    const selected = Array.isArray(state.selectedFurnaceItems) ? state.selectedFurnaceItems : [];
    return selected.find((item) => item && item.name && item.count > 0) || null;
  }

  // Vraća prvi preostali queue item koji je trenutno dostupan u inventoryju.
  getNextAvailableSelectedItem(bot, state) {
    const selected = Array.isArray(state.selectedFurnaceItems) ? state.selectedFurnaceItems : [];

    for (const item of selected) {
      if (!item || !item.name || item.count <= 0) continue;
      const invItem = findInventoryItemByNames(bot, [item.name]);
      if (invItem && invItem.count > 0) {
        return { selectedItem: item, inventoryItem: invItem };
      }
    }

    return null;
  }

  // Skida N smeltanih inputa iz queuea nakon uspješnog output collecta.
  consumeSelectedItem(state, consumedName, count = 1) {
    const selected = Array.isArray(state.selectedFurnaceItems) ? state.selectedFurnaceItems : [];
    const nextItems = [];

    for (const item of selected) {
      if (!item || !item.name || item.count <= 0) continue;

      if (item.name === consumedName && count > 0) {
        const remaining = item.count - count;
        if (remaining > 0) {
          nextItems.push({ name: item.name, count: remaining });
        }
        // consume only once per call
        count = 0;
        continue;
      }

      nextItems.push({ name: item.name, count: item.count });
    }

    state.selectedFurnaceItems = nextItems;
  }

  // Pokušava pokupiti output iz furnace containera.
  async collectOutput(furnace, fallbackCount = 1) {
    if (typeof furnace.takeOutput !== "function") {
      throw new Error("Furnace container does not support takeOutput().");
    }

    const getOutputCount = () => {
      if (typeof furnace.outputItem !== "function") return 0;
      const outputItem = furnace.outputItem();
      return outputItem?.count || 0;
    };

    // Use output-slot delta for confirmation instead of takeOutput() return value.
    const outputBefore = getOutputCount();
    if (outputBefore <= 0) {
      return 0;
    }

    try {
      await furnace.takeOutput();
    } catch (e) {
      // Transfer nije uspio (npr. inventory space), pokušaj ponovo kasnije.
      return 0;
    }

    const outputAfter = getOutputCount();
    const transferred = Math.max(0, outputBefore - outputAfter);
    if (transferred > 0) {
      return transferred;
    }

    // Fallback for APIs that don't immediately refresh output slot state.
    return Math.min(outputBefore, Math.max(1, fallbackCount));
  }

  // Otvara pećnicu i priprema session za sljedeći tick.
  async openFurnaceIfNeeded(bot, state) {
    if (state.furnaceContainer) {
      state.furnaceLoadPhase = "PUT_FUEL";
      return state.furnaceContainer;
    }

    const target = state[this.stateBlockKey];
    if (!target || !target.position) {
      bot.chat("No furnace target block in state.");
      return null;
    }

    const furnaceBlock = bot.blockAt(target.position);
    if (!furnaceBlock || !furnaceBlock.name || !furnaceBlock.name.includes("furnace")) {
      bot.chat("Furnace block not found at blockTarget.");
      // Clear invalid target to trigger re-search in future ticks.
      state[this.stateBlockKey] = null;
      return null;
    }

    state.furnaceContainer = await bot.openFurnace(furnaceBlock);
    state.furnaceLoadPhase = "PUT_FUEL";
    state.furnaceLoadDone = false;
    return state.furnaceContainer;
  }

  async tick(bot, state, config) {
    const phase = state.furnaceLoadPhase || "OPEN";
    state.furnaceProtection = true; // Postavi zaštitu da spriječi PlaceBlockNode da postavlja blokove dok se furnace učitava/istovara.
    try {
      if (phase === "OPEN") {
        const furnace = await this.openFurnaceIfNeeded(bot, state);
        if (furnace) {
          return "RUNNING";
        } else {
          bot.chat("LOAD FURNACE -> Failed to open furnace container.");
          return "FAILURE";
        }
      }

      if (phase === "PUT_FUEL") {
        const furnace = state.furnaceContainer;
        if (!furnace) {
          bot.chat("LOAD FURNACE -> No furnace container available in PUT_FUEL phase.");
          return "FAILURE";
        }

        const fuelNames = [state.reservedFuel?.name].filter(Boolean);
        const effectiveFuelNames = fuelNames.length ? fuelNames : ["coal"];
        const fuelNameSet = new Set(effectiveFuelNames);
        const fuelCandidates = bot.inventory
          .items()
          .filter((item) => fuelNameSet.has(item.name))
          .sort((a, b) => b.count - a.count);

        if (fuelCandidates.length === 0) {
          bot.chat("LOAD FURNACE -> No fuel in inventory.");
          await this.closeContainerIfOpen(state);
          this.resetLoadState(state);
          return "FAILURE";
        }

        const plannedFuel = Math.max(1, state.reservedFuel?.count || 1);
        let remainingFuel = plannedFuel;
        let insertedFuel = 0;

        for (const candidate of fuelCandidates) {
          if (remainingFuel <= 0) break;

          const fuelToInsert = Math.min(candidate.count, remainingFuel);
          if (fuelToInsert <= 0) continue;

          try {
            await furnace.putFuel(candidate.type, null, fuelToInsert);
            insertedFuel += fuelToInsert;
            remainingFuel -= fuelToInsert;
          } catch (err) {
            // Continue with other fuel stacks if one transfer fails.
            console.log("LOAD FURNACE -> Fuel insert attempt failed:", err.message);
          }
        }

        if (insertedFuel <= 0) {
          bot.chat("LOAD FURNACE -> Failed to insert fuel into furnace.");
          await this.closeContainerIfOpen(state);
          this.resetLoadState(state);
          return "FAILURE";
        }

        if (insertedFuel < plannedFuel) {
          bot.chat(`LOAD FURNACE -> Inserted ${insertedFuel}/${plannedFuel} fuel units.`);
        } else {
          bot.chat(`LOAD FURNACE -> Inserted ${insertedFuel} fuel units into furnace.`);
        }

        state.furnaceLoadedFuelCount = insertedFuel;
        state.furnaceLoadPhase = "PUT_INPUT";
        return "RUNNING";
      }

      if (phase === "PUT_INPUT") {
        const furnace = state.furnaceContainer;
        if (!furnace) {
          bot.chat("LOAD FURNACE -> No furnace container available in PUT_INPUT phase.");
          return "FAILURE";
        }

        const nextAvailable = this.getNextAvailableSelectedItem(bot, state);
        if (!nextAvailable) {
          bot.chat("LOAD FURNACE -> No selected input items remain.");
          await this.closeContainerIfOpen(state);
          this.resetLoadState(state);
          return "FAILURE";
        }

        const nextItem = nextAvailable.selectedItem;
        const invItem = nextAvailable.inventoryItem;

        const amount = Math.min(invItem.count, nextItem.count);
        await furnace.putInput(invItem.type, null, amount);
        bot.chat(`LOAD FURNACE -> Inserted ${amount} of ${nextItem.name} into furnace.`);
        state.furnaceCurrentInputName = nextItem.name;
        state.furnaceCurrentBatchCount = amount;
        state.furnaceLoadedInputCount = amount;
        state.furnaceLoadedAt = Date.now();
        state.furnaceExpectedCompleteAt = state.furnaceLoadedAt + (config?.FURNACE?.TIME_PER_ITEM_MS || 10000) * amount;
        state.furnaceLoadDone = true;
        state.furnaceLoadPhase = "WAIT_SMELT";
        return "RUNNING";
      }

      if (phase === "WAIT_SMELT") {
        const readyAt = state.furnaceExpectedCompleteAt || 0;
        console.log(`[WaitFurnace] RUNNING remaining=${Math.ceil((readyAt - Date.now()) / 1000)}s`);
        if (Date.now() < readyAt) {
          return "RUNNING";
        }

        state.furnaceLoadPhase = "COLLECT_OUTPUT";
        return "RUNNING";
      }

      if (phase === "COLLECT_OUTPUT") {
        const furnace = state.furnaceContainer;
        if (!furnace) return "FAILURE";

        const currentInputName = state.furnaceCurrentInputName || this.getNextSelectedItem(state)?.name;
        if (!currentInputName) {
          bot.chat("LOAD FURNACE -> No selected input items remain for output collection.");
          await this.closeContainerIfOpen(state);
          this.resetLoadState(state);
          return "FAILURE";
        }

        const expectedBatchCount = Math.max(
          1,
          state.furnaceCurrentBatchCount || state.furnaceLoadedInputCount || 1,
        );
        const collected = await this.collectOutput(furnace, expectedBatchCount);

        if (collected <= 0) {
          // Output još nije spreman, vrati se kratko čekati pa probaj opet.
          state.furnaceExpectedCompleteAt = Date.now() + 1000;
          state.furnaceLoadPhase = "WAIT_SMELT";
          return "RUNNING";
        }

        bot.chat(`LOAD FURNACE -> Collected ${collected} output items for ${currentInputName}.`);

        this.consumeSelectedItem(state, currentInputName, collected);
        state.furnaceCurrentInputName = null;
        state.furnaceCurrentBatchCount = 0;
        state.furnaceLoadedInputCount = 0;

        if (this.getNextSelectedItem(state)) {
          state.furnaceLoadedAt = null;
          state.furnaceExpectedCompleteAt = null;
          state.furnaceLoadDone = false;
          state.furnaceLoadPhase = "PUT_INPUT";
          return "RUNNING";
        }

        await this.closeContainerIfOpen(state);
        state.furnaceLoadPhase = "DONE";
        return "SUCCESS";
      }

      if (phase === "DONE") {
        return "SUCCESS";
      }

      return "FAILURE";
    } catch (err) {
      console.error("LoadFurnaceNode error:", err);
      await this.closeContainerIfOpen(state);
      this.resetLoadState(state);
      return "FAILURE";
    }
  }
}

module.exports = LoadFurnaceNode;

