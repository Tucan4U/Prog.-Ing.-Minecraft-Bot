const { Node } = require('../behaviorTree');

class BreakLogNode extends Node {
  constructor() {
    super("BreakLog");
  }

  async tick(bot, state) {
    const block = state.logTarget;

    if (!block) {
      return 'FAILURE';
    }

    // block already gone
    const current = bot.blockAt(block.position);
    if (!current || current.name === 'air') {
      state.logTarget = null;
      return 'FAILURE';
    }

    // equip an axe if available
    const axe = bot.inventory.items().find(
      (item) => item.name.endsWith('_axe')
    );
    if (axe) {
      await bot.equip(axe, "hand").catch(() => {});
    }

    try {
      await bot.collectBlock.collect(block, { ignoreNoPath: true });
      await bot.waitForTicks(8);
    } catch (err) {
      console.log("BreakLog error:", err.message);
      state.logTarget = null;
      return 'FAILURE';
    }

    state.logTarget = null;
    return 'SUCCESS';
  }
}

module.exports = BreakLogNode;
