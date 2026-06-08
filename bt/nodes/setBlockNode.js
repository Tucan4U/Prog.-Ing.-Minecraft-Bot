const { Node } = require("../behaviorTree");
const { hasAnyItem } = require("../../utils/inventory");

class SetBlockNode extends Node {
  constructor(blockType, stateKey = "blockTarget") {
    super("SetBlockNode");
    this.blockType = blockType;
    this.stateKey = stateKey;
    this.mcData = null;
  }

  async tick(bot, state, config) {

    if(!this.mcData) {
        this.mcData = require("minecraft-data")(bot.version);
    }


    const keys = Array.isArray(this.blockType)
      ? this.blockType
      : [this.blockType];

    const targetBlock = state[this.stateKey];
    if (!targetBlock) {
      console.log(`[SetBlockNode] No target block in state under key ${this.stateKey}`);
      return "FAILURE";
    }

    const waterBlocks = bot.findBlocks({
      maxDistance: this.maxBlockDistance,
      matching: this.mcData.blocksByName["water"]?.id,
      count: 32,
    });

    const checkLiquidBlock = bot.blockAt(waterBlocks[0]);

    if(checkLiquidBlock._properties || checkLiquidBlock._properties !== {}) {
      for(let block of waterBlocks){
        let blockInfo = bot.blockAt(block);
        if(blockInfo._properties?.level === "0"){
          console.log("Found source liquid 'block' at: ", block);
          waterBlocks[0] = block;
          break;
        }
      }
    }

    const blocks = bot.findBlocks({
      maxDistance: 10,
      matching: this.mcData.blocksByName["obsidian"]?.id,
      count: 5,
    });

    if(blocks.length > 0) {
        if(bot.entity.position.distanceTo(bot.blockAt(blocks[0]).position) < 3) {
            for (const key of keys) {
                console.log(`Setting block at ${waterBlocks[0]} to ${key}`);
                if(bot.blockAt(waterBlocks[0])._properties?.level === "0"){ {
                    bot.chat(`/setblock ${waterBlocks[0].x} ${waterBlocks[0].y} ${waterBlocks[0].z} ${key}`);
                    return "SUCCESS";
                }
            }
        }
    }
}


    

    return "FAILURE";
  }
}

module.exports = SetBlockNode;
