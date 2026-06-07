const { Node } = require("../behaviorTree");
const { hasAnyItem } = require("../../utils/inventory");

class RemoveItemNode extends Node {
  constructor(configKey, count) {
    super("RemoveItemNode");
    this.configKey = configKey;
    this.count = count;
    this.removed = false;
  }

  async tick(bot, state, config) {
    if (this.removed) return "SUCCESS";
    const keys = Array.isArray(this.configKey)
      ? this.configKey
      : [this.configKey];

    for (const key of keys) {
      if (hasAnyItem(bot, [key])) {
        bot.chat(`/clear @s ${key} ${this.count}`);
        // bot.chat(`Removed ${this.count} of ${key} from inventory.`);
        this.removed = true;
        return "SUCCESS";
      }
    }

    return "FAILURE";
  }
}

module.exports = RemoveItemNode;
