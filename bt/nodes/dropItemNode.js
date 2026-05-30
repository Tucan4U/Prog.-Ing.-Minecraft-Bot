const { Node } = require("../behaviorTree");
const mcData = require("minecraft-data");
const Vec3 = require("vec3");

class DropItemNode extends Node {
  constructor(configKey, amountToDrop = 1, stateKey = "lootTarget") {
    super("DropItem");
    this.mcData = null;
    this.configKey = configKey; //name of item to be dropped
    this.amountToDrop = amountToDrop;
    this.stateKey = stateKey;
  }

  async tick(bot, state, config) {
    const item = bot.inventory.items().find((i) => i.name === this.configKey);
    // if (item) {
    //     await bot.toss(item, this.amountToDrop);
    //     return "SUCCESS";
    // }
    // if (!item) {
    //     bot.chat("Item not found in inventory!");
    //     return "FAILURE";
    // }

    try {
        await bot.toss(item, 1);
        bot.chat("Dropped an item!");
        return "SUCCESS";
    } catch (err) {
        bot.chat("Dropping failed: " + err.message);
        console.log("Dropping failed: ", err);
        return "FAILURE";
    }
  }
}

module.exports = DropItemNode;
