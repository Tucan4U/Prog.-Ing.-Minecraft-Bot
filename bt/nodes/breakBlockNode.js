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
    const targetBlock = state[this.stateKey];
    
    if (!targetBlock) {
      console.log("There is no target block");
      return "FAILURE";
    }

    const block = bot.blockAt(targetBlock.position);

    if (!block || block.name.includes("air")) {
      console.log("Block is already air");
      state["digTask"] = null;
      //state[this.stateKey] = null;
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
          //state["blockTarget"] = null;
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
      console.log("Started digging block", block.name);
      return "RUNNING";
    }
    console.log("Already digging, waiting for completion");
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


