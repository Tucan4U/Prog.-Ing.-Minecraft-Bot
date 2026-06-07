const { Node } = require("../behaviorTree");
const { findInventoryItemByNames } = require("../../utils/inventory");

class EquipItemNode extends Node {
  constructor(configKey) {
    super("EquipItem");
    this.configKey = configKey;
  }

  async tick(bot, state, config) {
        const itemName = this.configKey.toLowerCase();

        if (bot.heldItem && bot.heldItem.name === itemName) return "SUCCESS";

        const itemToEquip = findInventoryItemByNames(bot, [itemName]);

    if(!itemToEquip) {
                console.log(`[EquipItem] No ${itemName} in inventory!`);
        return "FAILURE";
    }

    console.log(`Trying to equip: ${itemToEquip.name}`)

    try {
        await bot.equip(itemToEquip, "hand");
    } catch (err) {
        console.log(`[EquipItem] error equipping ${this.configKey}:`, err.message);
        return "FAILURE";
    }

        return "RUNNING";
    }
}

module.exports = EquipItemNode;