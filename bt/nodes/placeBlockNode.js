const { Node } = require("../behaviorTree");
const mcData = require("minecraft-data");
const Vec3 = require("vec3");

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

    let blockAbove = state[this.stateKey];

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

    let blockToPlaceId = this.mcData.itemsByName[this.configKey]?.id;

    bot.chat(`${this.configKey}`);
    bot.chat(`${blockToPlaceId}`);
    let blockBelow = bot.blockAt(blockAbove.position.offset(0, -1, 0));

    if (!bot.inventory.items().some((item) => item.name === this.configKey)) {
      console.log(`No ${this.configKey} in inventory!`);
      return "FAILURE";
    }
    try {
      await bot.equip(blockToPlaceId, "hand");
    } catch (err) {
      console.log("No block in inventory:", err);
      bot.chat("No block in inventory");
    }

    const aroundBlockAbove = [
      blockAbove.position.offset(1, 0, 0),
      blockAbove.position.offset(-1, 0, 0),
      blockAbove.position.offset(0, 0, 1),
      blockAbove.position.offset(0, 0, -1),
      blockAbove.position.offset(0, 1, 0),
      blockAbove.position.offset(0, -1, 0),
    ];

    for (let pos of aroundBlockAbove) {
      const neighbor = bot.blockAt(pos);
      if (neighbor && !neighbor.name.includes("air")) {
        const face = blockAbove.position.minus(pos); // smjer prema blockAbove
        try {
          await bot.placeBlock(neighbor, face);
        } catch (e) {
          const newBlock = bot.blockAt(blockAbove.position);
          if (newBlock?.name === this.configKey) return "SUCCESS";
          console.log("Errrror placing block:", e);
          bot.chat("Error placing block");
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
