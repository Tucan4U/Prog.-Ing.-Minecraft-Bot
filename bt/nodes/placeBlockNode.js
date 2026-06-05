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
    if (!state.mission.placedItems) {
      state.mission.placedItems = {};
    }

    if (state.mission.placedItems[this.configKey]) return "SUCCESS";

    if (!this.mcData) {
      this.mcData = mcData(bot.version);
    }

    let blockToPlaceId = this.mcData.itemsByName[this.configKey]?.id;

    let blockAbove = state[this.stateKey];

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

    if (
      blockAbove &&
      blockBelow &&
      blockAbove.name === "air" &&
      blockBelow.name !== "air"
    ) {
      try {
        await bot.placeBlock(blockBelow, new Vec3(0, 1, 0)).then(() => {
          const newBlock = bot.blockAt(blockAbove.position);
          if (newBlock.name === this.configKey) {
            state.mission.placedItems[this.configKey] = 1;
            if (this.configKey === "crafting_table") {
              state.mission.hasCraftingTable = true;
            }
            return "SUCCESS";
          }
        });
      } catch (err) {
        state["blockTarget"] = null;
        console.log("Error placing block:", err);
        bot.chat("Error placing block");
      }
    } else return "FAILURE";
    return "RUNNING";
  }
}

module.exports = PlaceBlockNode;
