const { Node } = require("../behaviorTree");
const { hasAnyItem } = require("../../utils/inventory");

class GiveItemNode extends Node {
  constructor(configKey, count) {
    super("GiveItemNode");
    this.configKey = configKey;
    this.count = count;
  }

  async tick(bot, state, config) {
    const keys = Array.isArray(this.configKey)
      ? this.configKey
      : [this.configKey];

    for (const key of keys) {
      bot.chat(`/give @s ${key} ${this.count}`);
      bot.chat(`Crafted ${this.count} of ${key}.`);
      state.craftingTableProtection = false; // Set protection flag to prevent other actions during crafting
      return "SUCCESS";
    }

    return "FAILURE";
  }
}

module.exports = GiveItemNode;
