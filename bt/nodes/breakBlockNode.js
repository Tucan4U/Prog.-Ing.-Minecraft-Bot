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
    // const lootTarget = state["lootTarget"];
    // if (lootTarget) {
    //   console.log("We have a loot target, picking it up first");
    //   return "SUCCESS";
    // }
    const targetBlock = state[this.stateKey];
    if (!targetBlock) {
      console.log("There is no target block");
      return "FAILURE";
    }

    const block = bot.blockAt(targetBlock.position);

    if (!block || block.name.includes("air")) {
      console.log("Block is already air");
      state["digTask"] = null;
      state[this.stateKey] = null;
      return "SUCCESS";
    }

    const dist = bot.entity.position.distanceTo(block.position);
    if (dist > this.reachDistance + 1) {
      console.log("Block too far away");
      bot.stopDigging();
      state["digTask"] = null;
      state["blockTarget"] = null;
      return "FAILURE";
    }
    console.log("Ovo je trenutno stanje dig taska: ", state["digTask"]);
    if (!state["digTask"]) {
      if (state["digTask"]) {
        return "RUNNING"; ////OVO moramo ovako napravi jer bot.dig() vraća promise koji se resolvea kad je kopanje gotovo, a mi ne želimo pokrenuti novi dig dok je stari još u tijeku
      } else {
        bot.pathfinder.setGoal(null);

        await equipBestWeapon(bot, config[this.tools] || []);

        state["digTask"] = bot
          .dig(block)
          .catch((err) => {
            console.error("Dig error:", err);
            state["digTask"] = null;
          })
          .then(() => {
            state["digTask"] = null;
            state["blockTarget"] = null;
            return "SUCCESS";
          });
        console.log("Postavili smo digTask", state["digTask"]);
        // re-check in case block disappeared immediately
        const afterBlock = bot.blockAt(targetBlock.position);
        if (
          !afterBlock ||
          (afterBlock.name && afterBlock.name.includes("air"))
        ) {
          state["digTask"] = null;
          bot.chat("SUCCESS: Block became air immediately.");
          return "SUCCESS";
        }
        return "RUNNING";
      }
    }

    return "RUNNING";
  }
}

module.exports = BreakBlockNode;
