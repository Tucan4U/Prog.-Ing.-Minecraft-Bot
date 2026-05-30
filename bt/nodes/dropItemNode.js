const { Node } = require("../behaviorTree");
const mcData = require("minecraft-data");
const Vec3 = require("vec3");

class DropItemNode extends Node {
  constructor(configKey, amountToDrop = 1, stateKey = "currentTarget") {
    super("DropItem");
    this.mcData = null;
    this.configKey = configKey; //name of item to be dropped
    this.amountToDrop = amountToDrop;
    this.stateKey = stateKey;
  }

  async tick(bot, state, config) {
    const target = state[this.stateKey];
    const itemToDrop = bot.registry.itemsByName[this.configKey];
    const stack = bot.inventory.items().find(item => item.type === itemToDrop.id);

    console.log(target.position);

    if (!stack) {
        bot.chat("No item in inventory.");
        return "FAILURE";
    }

    if (target){
        bot.lookAt(target.position.offset(0, target.height, 0), true);
    }

    try {
        await bot.toss(itemToDrop.id, null, this.amountToDrop);
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
