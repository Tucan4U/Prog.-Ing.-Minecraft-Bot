const { Node } = require("../behaviorTree");
const { equipArmor } = require("../../utils/netherEquipment");

class EquipArmorNode extends Node {
  constructor() {
    super("EquipArmor");
  }

  async tick(bot, state) {
    try {
      await equipArmor(bot);
      return "SUCCESS";
    } catch (err) {
      bot.chat(`Failed to equip armor: ${err.message}`);
      return "FAILURE";
    }
  }
}

module.exports = EquipArmorNode;
