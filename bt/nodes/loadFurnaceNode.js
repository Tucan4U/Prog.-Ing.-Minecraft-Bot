const { Node } = require("../behaviorTree");

class LoadFurnaceNode extends Node {
  constructor(stateBlockKey = "blockTarget") {
    super("LoadFurnace");
    this.stateBlockKey = stateBlockKey;
  }

  // Vraća load-state u početno stanje bez diranja workflow flagova.
  resetLoadState(state) {
    state.furnaceLoadPhase = null;
    state.furnaceContainer = null;
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

  async tick(bot, state, config) {
    const phase = state.furnaceLoadPhase || "OPEN";

    try {
      if (phase === "OPEN") {
        const target = state[this.stateBlockKey];
        if (!target || !target.position) {
          bot.chat("No furnace target block in state.");
          return "FAILURE";
        }

        const furnaceBlock = bot.blockAt(target.position);
        if (!furnaceBlock || !furnaceBlock.name || !furnaceBlock.name.includes("furnace")) {
          bot.chat("Furnace block not found at blockTarget.");
          return "FAILURE";
        }

        state.furnaceContainer = await bot.openFurnace(furnaceBlock);
        state.furnaceLoadPhase = "PUT_FUEL";
        state.furnaceLoadDone = false;
        return "RUNNING";
      }

      if (phase === "PUT_FUEL") {
        const furnace = state.furnaceContainer;
        if (!furnace) return "FAILURE";

        const coal = bot.inventory.items().find((item) => item.name === "coal");
        if (!coal) {
          bot.chat("LOAD FURNACE -> No coal in inventory.");
          await this.closeContainerIfOpen(state);
          this.resetLoadState(state);
          return "FAILURE";
        }

        const plannedFuel = Math.max(1, state.reservedFuel?.count || 1);
        const fuelToInsert = Math.min(coal.count, plannedFuel);

        await furnace.putFuel(coal.type, null, fuelToInsert);
        bot.chat(`LOAD FURNACE -> Inserted ${fuelToInsert} fuel units into furnace.`);
        state.furnaceLoadedFuelCount = fuelToInsert;
        state.furnaceLoadPhase = "PUT_INPUT";
        return "RUNNING";
      }

      if (phase === "PUT_INPUT") {
        const furnace = state.furnaceContainer;
        if (!furnace) return "FAILURE";

        const selected = state.selectedFurnaceItems || [];
        let insertedInput = 0;

        for (const req of selected) {
          if (!req || !req.name || !req.count) continue;

          const invItem = bot.inventory.items().find((item) => item.name === req.name);
          if (!invItem) continue;

          const amount = Math.min(invItem.count, req.count);
          if (amount <= 0) continue;

          await furnace.putInput(invItem.type, null, amount);
          bot.chat(`LOAD FURNACE -> Inserted ${amount} of ${req.name} into furnace.`);
          insertedInput += amount;
        }

        if (insertedInput <= 0) {
          bot.chat("LOAD FURNACE -> No valid input items inserted into furnace.");
          await this.closeContainerIfOpen(state);
          this.resetLoadState(state);
          return "FAILURE";
        }

        state.furnaceLoadedInputCount = insertedInput;
        state.furnaceLoadPhase = "FINALIZE";
        return "RUNNING";
      }

      if (phase === "FINALIZE") {
        const msPerItem = config?.FURNACE?.TIME_PER_ITEM_MS || 10000;
        const totalMs = state.furnaceLoadedInputCount * msPerItem;

        state.furnaceLoadedAt = Date.now();
        state.furnaceExpectedCompleteAt = state.furnaceLoadedAt + totalMs;
        state.furnaceLoadDone = true;
        bot.chat(`LOAD FURNACE -> Expected to complete in ${Math.ceil(totalMs / 1000)} seconds.`);
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

