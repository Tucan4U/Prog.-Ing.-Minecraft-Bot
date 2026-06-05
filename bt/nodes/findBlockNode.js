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

    if (targetBlock) {
      console.log("Block already targeted");
      return "SUCCESS";
    }

    const blocks = bot.findBlocks({
      maxDistance: this.maxBlockDistance,
      matching: config.BLOCKS[this.configKey].names
        .map((name) => this.mcData.blocksByName[name]?.id)
        .filter(Boolean),
      count: 1,
    });

    if (!blocks.length) {
      console.log("No blocks found nearby, expanding search radius");
      this.maxBlockDistance *= 2;
      return "FAILURE";
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
