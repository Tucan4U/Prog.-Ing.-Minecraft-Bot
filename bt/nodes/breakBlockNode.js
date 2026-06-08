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
    if (!targetBlock) {
      //console.log("There is no target block");
      return "FAILURE";
    }

    const block = bot.blockAt(targetBlock.position);

    if (!block || block.name === "air") {
      state["digTask"] = null;
      state[this.stateKey] = null;
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

      state["digTask"] = bot
        .dig(block)
        .catch((err) => {
          console.error("Dig error:", err);
          state["digTask"] = null;
        })
        .then(() => {
          state["digTask"] = null;
        });
      console.log("Postavili smo digTask", state["digTask"]);
      // re-check in case block disappeared immediately
      const afterBlock = bot.blockAt(targetBlock.position);
      if (!afterBlock || (afterBlock.name && afterBlock.name.includes("air"))) {
        state["digTask"] = null;

        bot.chat("SUCCESS: Block became air immediately.");
        if (targetBlock.name === "crafting_table") {
              state.mission.placedItems["crafting_table"] = null;
            }
        return "SUCCESS";
      }
      return "RUNNING";
    }

    // ako je dig još u toku
    if (state["digTask"]) {
      const cur = bot.blockAt(targetBlock.position);
      if (!cur || (cur.name && cur.name.includes("air"))) {
        state["digTask"] = null;

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
/*
const { Node } = require('../behaviorTree')
const { equipBestWeapon } = require('../../utils/inventory')

class BreakBlockNode extends Node {
    constructor(stateKey, reachDistance, tools) {
        super('BreakBlock')
        this.stateKey = stateKey
        this.reachDistance = reachDistance
        this.tools = tools
    }

    async tick(bot, state, config) {
        if (state.lootTarget) return 'SUCCESS'
        const targetBlock = state[this.stateKey]
        if (!targetBlock) return 'FAILURE'

        const block = bot.blockAt(targetBlock.position)
        if (block.name === 'air') {
            state.digTask = null
            state[this.stateKey] = null
            return 'SUCCESS'
        }

        const dist = bot.entity.position.distanceTo(block.position)
        if (dist > this.reachDistance) { state.digTask = null; return 'FAILURE' }

        if (!state.digTask) {
            bot.pathfinder.setGoal(null)
            await equipBestWeapon(bot, config[this.tools] || [])
            
            // DODANO; nije mi radilo kopanje pumpkina
            await bot.lookAt(block.position.offset(0.5, 0.5, 0.5))
           state.digTask = bot.dig(block)
                .then(() => {
                    state.digTask = null
                    state[this.stateKey] = null
                })
                .catch(err => {
                    console.log("Dig error:", err.message)
                    state.digTask = null
                })

            return 'RUNNING'
        }

        
    }
}*/


