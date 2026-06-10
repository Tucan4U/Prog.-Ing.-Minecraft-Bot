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

    if(targetBlock.name === this.blockType || keys.includes(targetBlock.name)) {
        console.log(`[SetBlockNode] Target block is already of type ${targetBlock.name}`);
        return "SUCCESS";
    }

    const waterBlocks = bot.findBlocks({
      maxDistance: this.maxBlockDistance,
      matching: this.mcData.blocksByName["water"]?.id,
      count: 64,
    });

    if (!waterBlocks.length) {
      console.log(`[SetBlockNode] No water blocks found nearby to set.`);
      this.maxBlockDistance *= 2;
      return "FAILURE";
    }

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
    for (const key of keys) {
      if(bot.blockAt(waterBlocks[0])._properties?.level === "0"){ 
        console.log(`Setting block at ${waterBlocks[0]} to ${key}`);
        bot.chat(`/setblock ${waterBlocks[0].x} ${waterBlocks[0].y} ${waterBlocks[0].z} ${key}`);
        return "SUCCESS";       
      }
    }
    console.log(`No source liquid block found among nearby blocks to set. Cannot set block.`);
    return "FAILURE";
}


    

    
  }


module.exports = SetBlockNode;
