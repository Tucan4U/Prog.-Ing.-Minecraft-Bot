const { Node } = require('../behaviorTree');
const { getMissingEquipment } = require('../../utils/netherEquipment');

// Verifies the bot has the required Nether equipment before attempting portal entry.
// If gear is missing, this node fails and the Nether sequence stops.
class CheckEquipmentNode extends Node {
  constructor() {
    super('CheckEquipment');
  }

  async tick(bot, state) {
    const missing = getMissingEquipment(bot);
    if (missing.length === 0) {
      return 'SUCCESS';
    }

    bot.chat(`Missing equipment: ${missing.join(', ')}`);
    return 'FAILURE';
  }
}

module.exports = CheckEquipmentNode;
