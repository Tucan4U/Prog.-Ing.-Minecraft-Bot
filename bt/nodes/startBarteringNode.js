const { Node } = require("../behaviorTree");
const { equipArmor } = require("../../utils/netherEquipment");

class ToggleBarteringNode extends Node {
  constructor() {
    super("StartBartering");
  }

  async tick(bot, state) {
    state.isBartering = !state.isBartering;
  }
}

module.exports = ToggleBarteringNode;
