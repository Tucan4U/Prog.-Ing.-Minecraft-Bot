const { Node } = require("../behaviorTree");
const mcData = require("minecraft-data");

class FindBlockNode extends Node {
  constructor(configKey, stateKey = "blockTarget", maxBlockDistance, selectLowestBlock = false) {
    super("FindBlock");
    this.mcData = null;
    this.configKey = configKey;
    this.stateKey = stateKey;
    this.maxBlockDistance = maxBlockDistance;
    this.selectLowestBlock = selectLowestBlock;
  }

  async tick(bot, state, config) {
    if (!this.mcData) {
      this.mcData = mcData(bot.version);
    }
    const item = state["lootTarget"];
    if (item) return "SUCCESS";

    let block = state[this.stateKey];

    if (block && !bot.blockAt(block.position)) {
      console.log("Block invalid");
      state[this.stateKey] = null;
    }

    if (block) {
      return "SUCCESS";
    }

    const blocks = bot.findBlocks({
      maxDistance: this.maxBlockDistance,
      matching: config.BLOCKS[this.configKey].names
        .map((name) => this.mcData.blocksByName[name]?.id)
        .filter(Boolean),
      count: this.selectLowestBlock ? 64 : 1,
    });

    if (!blocks.length) {
      console.log("No blocks found nearby, expanding search radius");
      this.maxBlockDistance *= 2;
      return "FAILURE";
    }

    let target = blocks[0];
    if (this.selectLowestBlock) {
      const botPos = bot.entity?.position;
      const distanceSq = (pos) => {
        if (!botPos) return 0;
        const dx = pos.x - botPos.x;
        const dy = pos.y - botPos.y;
        const dz = pos.z - botPos.z;
        return dx * dx + dy * dy + dz * dz;
      };

      blocks.sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return distanceSq(a) - distanceSq(b);
      });
      target = blocks[0];
    }

    state[this.stateKey] = bot.blockAt(target);
    console.log(
      `New block found: ${target.x}, ${target.y}, ${target.z}`,
    );

    this.maxBlockDistance = 16;
    return "SUCCESS";
  }
}

module.exports = FindBlockNode;
