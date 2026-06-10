const { Node } = require("../behaviorTree");
const mcData = require("minecraft-data");
const Vec3 = require("vec3");
const { findInventoryItemByNames } = require("../../utils/inventory");

class PlaceBlockNode extends Node {
  constructor(configKey, stateKey = "blockTarget") {
    super("PlaceBlock");
    this.mcData = null;
    this.configKey = configKey; //ime JEDNOG bloka za postavljanje
    this.stateKey = stateKey;
  }

  async tick(bot, state, config) {
    if (state.furnaceProtection) {
      return "SUCCESS";
    }

    if (state.mission.placedItems[this.configKey]) {
      console.log("zajeb sa placed items");
      console.log(state.mission.placedItems[this.configKey]);
      return "SUCCESS";
    }
    let blockAbove = state[this.stateKey];

    if (!blockAbove || !blockAbove.position) {
      return "FAILURE";
    }

    if (blockAbove) {
      const currBlock = bot.blockAt(blockAbove.position);
      if (
        currBlock &&
        (currBlock.name === this.configKey ||
          (currBlock.name.includes("air") && state["digTask"]))
      ) {
        return "SUCCESS";
      }
    }

    if (!this.mcData) {
      this.mcData = mcData(bot.version);
    }

    bot.chat(`${this.configKey}`);
    //bot.chat(`${blockToPlaceId}`);
    let blockBelow = bot.blockAt(blockAbove.position.offset(0, -1, 0));
    const blockToPlace = findInventoryItemByNames(bot, [this.configKey]);

    if (!blockToPlace) {
      console.log(`No ${this.configKey} in inventory!`);
      return "FAILURE";
    }

    try {
      await bot.equip(blockToPlace, "hand");
    } catch (err) {
      console.log("No block in inventory:", err);
      return "FAILURE";
    }

    const aroundBlockAbove = [
      blockAbove.position.offset(0, 1, 0),
      blockAbove.position.offset(0, -1, 0),
      blockAbove.position.offset(1, 0, 0),
      blockAbove.position.offset(-1, 0, 0),
      blockAbove.position.offset(0, 0, 1),
      blockAbove.position.offset(0, 0, -1),
    ];

    for (let pos of aroundBlockAbove) {
      const neighbor = bot.blockAt(pos);
      if (neighbor && !neighbor.name.includes("air")) {
        const face = blockAbove.position.minus(pos); // smjer prema blockAbove
        try {
          // Pokušavamo postaviti blok
          await bot.placeBlock(neighbor, face);
          
          // Ako je prošlo bez greške, provjeravamo je li blok stvarno tamo
          const placedBlock = bot.blockAt(blockAbove.position);
          if (placedBlock?.name === this.configKey) {
            return "SUCCESS";
          }
        } catch (e) {
          console.log("Pokušavam potvrditi postavljanje nakon greške...");
          
          // Čekamo kratko da se sinkronizira stanje sa serverom (npr. 200-500ms je sasvim dovoljno)
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          // Provjeravamo je li blok ipak postavljen unatoč greški na klijentu
          const placedBlock = bot.blockAt(blockAbove.position);
          if (placedBlock?.name === this.configKey) {
            console.log("Blok je uspješno postavljen unatoč greški u placeBlock!");
            return "SUCCESS";
          }
          console.log("Errrror placing block:", e);
          bot.chat("Couldn't place block, trying again...");
          state["blockTarget"] = null;
          return "FAILURE";
        }
      }

      //return "FAILURE";
    }

    return "RUNNING";
  }
}

module.exports = PlaceBlockNode;
