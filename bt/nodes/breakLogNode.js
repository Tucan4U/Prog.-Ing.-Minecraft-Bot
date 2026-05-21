const { Node } = require("../behaviorTree");
const { equipBestWeapon } = require("../../utils/inventory");

class BreakLogNode extends Node {
  constructor() {
    super("BreakLog");
  }

  async tick(bot, state, config) {
    const log = state.logTarget;
    if (!log) return "FAILURE";

    const block = bot.blockAt(log.position);
    if (!block) {
      console.log("Log disappeared");
      state.logTarget = null;
      state.digTask = null;
      return "FAILURE";
    }

    const dist = bot.entity.position.distanceTo(log.position);
    if (dist > 5) {
      console.log("Log too far away");
      return "FAILURE";
    }

    if (!state.digTask) {
      bot.pathfinder.setGoal(null);

      await equipBestWeapon(bot, config.AXES, state);

      state.digTask = bot
        .dig(block)
        .then(() => {
          state.digTask = null;
        })
        .catch((err) => {
          console.error("Dig error:", err);
          state.digTask = null;
        });

      return "RUNNING";
    }

    // ako je dig još u toku
    if (state.digTask) {
      if (!bot.blockAt(log.position)) {
        state.digTask = null;
        state.logTarget = null;
        return "SUCCESS";
      }
      return "RUNNING";
    }

    return "RUNNING";
  }
}

module.exports = BreakLogNode;
