const { Node } = require("../behaviorTree");
const mcData = require("minecraft-data");

class FindBlockNode extends Node {
  constructor(configKey, stateKey = "blockTarget", maxBlockDistance) {
    super("FindBlock");
    this.mcData = null;
    this.configKey = configKey;
    this.stateKey = stateKey;
    this.maxBlockDistance = maxBlockDistance;
  }

  async tick(bot, state, config) {
    if (!this.mcData) {
      this.mcData = mcData(bot.version);
    }
    // const item = state["lootTarget"];
    // if (item) return "SUCCESS";

    let targetBlock = state[this.stateKey];
    const block = targetBlock ? bot.blockAt(targetBlock.position) : null;

    if (targetBlock && (!block || block.name.includes("air"))) {
      console.log("Block invalid");
      state[this.stateKey] = null;
      return "FAILURE";
    }

    if (targetBlock && block && config.BLOCKS[this.configKey].names.includes(block.name)) {
      console.log("Block already targeted");
      console.log("Target block: ", targetBlock.name);
      return "SUCCESS";
    }

    const blocks = bot.findBlocks({
      maxDistance: this.maxBlockDistance,
      matching: config.BLOCKS[this.configKey].names
        .map((name) => this.mcData.blocksByName[name]?.id)
        .filter(Boolean),
      count: 10,
    });

    if (!blocks.length) {
      console.log("No blocks found nearby, expanding search radius");
      this.maxBlockDistance *= 2;
      return "FAILURE";
    }

    const checkLiquidBlock = bot.blockAt(blocks[0]);

    if(checkLiquidBlock._properties || checkLiquidBlock._properties !== {}) {
      for(let block of blocks){
        let blockInfo = bot.blockAt(block);
        if(blockInfo._properties?.level === "0"){
          console.log("Found liquid 'block' at: ", block);
          blocks[0] = block;
          break;
        }
      }
    }

    state[this.stateKey] = bot.blockAt(blocks[0]);
    console.log(
      `New block found: ${blocks[0].x}, ${blocks[0].y}, ${blocks[0].z}`,
    );

    this.maxBlockDistance = 16;
    return "SUCCESS";
  }
}

module.exports = FindBlockNode;
