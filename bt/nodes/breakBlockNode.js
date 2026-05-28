const { Node } = require("../behaviorTree");
const { equipBestWeapon } = require("../../utils/inventory");

class BreakBlockNode extends Node {
  constructor(stateKey, reachDistance, tools) {
    super("BreakBlock");
    this.stateKey = stateKey;
    this.reachDistance = reachDistance;
    this.tools = tools;
  }

  async tick(bot, state, config) {
    const lootTarget = state["lootTarget"];
    if (lootTarget) return "SUCCESS";
    const targetBlock = state[this.stateKey];
    if (!targetBlock) return "FAILURE";

    const block = bot.blockAt(targetBlock.position);

    if (!block || (block.name && block.name.includes("air"))) {
      state["digTask"] = null;
      state[this.stateKey] = null;
      bot.chat("SUCCESS: Block is already air or missing.");
      return "SUCCESS";
    }

    const dist = bot.entity.position.distanceTo(block.position);
    if (dist > this.reachDistance) {
      console.log("Log too far away");
      state["digTask"] = null;
      return "FAILURE";
    }

    if (!state["digTask"]) {
      bot.pathfinder.setGoal(null);

      await equipBestWeapon(bot, config[this.tools] || []);

      state["digTask"] = bot.dig(block).catch((err) => {
        console.error("Dig error:", err);
        state["digTask"] = null;
      }).then(() => {
        state["digTask"] = null;
      });
      console.log("Postavili smo digTask", state["digTask"]);
      // re-check in case block disappeared immediately
      const afterBlock = bot.blockAt(targetBlock.position);
      if (!afterBlock || (afterBlock.name && afterBlock.name.includes("air"))) {
        state["digTask"] = null;
        state[this.stateKey] = null;
        bot.chat("SUCCESS: Block became air immediately.");
        return "SUCCESS";
      }
      return "RUNNING";
    }

    // ako je dig još u toku
    if (state["digTask"]) {
      const cur = bot.blockAt(targetBlock.position);
      if (!cur || (cur.name && cur.name.includes("air"))) {
        state["digTask"] = null;
        state[this.stateKey] = null;
        bot.chat("SUCCESS: Block became air.");
        return "SUCCESS";
      }
      console.log("We are still digging.");
      return "RUNNING";
    }
    //console.log(block);
    return "RUNNING";
  }
}

module.exports = BreakBlockNode;
