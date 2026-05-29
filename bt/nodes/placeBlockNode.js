const { Node } = require("../behaviorTree");
const mcData = require("minecraft-data");
const Vec3 = require("vec3");

class PlaceBlockNode extends Node {
  constructor(configKey, stateKey = "blockTarget") {
    super("PlaceBlock");
    this.mcData = null;
    this.configKey = configKey; //ime JEDNOG bloka za postavljanje
    this.stateKey = stateKey;
  }

  async tick(bot, state, config) {
    if (!this.mcData) {
      this.mcData = mcData(bot.version);
    }

    let blockToPlaceId = this.mcData.itemsByName[this.configKey]?.id;

    let blockAbove = state[this.stateKey];

    bot.chat(`${this.configKey}`);
    bot.chat(`${blockToPlaceId}`);
    let blockBelow = bot.blockAt(blockAbove.position.offset(0, -1, 0));

    try{
        await bot.equip(blockToPlaceId, "hand");
    }catch{
        console.log("No block in inventory:", err);
        bot.chat("No block in inventory");
    }
    

    if (blockAbove && blockBelow && blockAbove.name === "air" && blockBelow.name !== "air") {
        try {  
            await bot.placeBlock(blockBelow, new Vec3(0, 1, 0));
          } catch (err) {
            console.log("Error placing block:", err);
            bot.chat("Error placing block");
          }
          let newBlock = bot.blockAt(blockAbove.position);
          if(newBlock.name === this.configKey){
            return "SUCCESS";
          }else return "FAILURE";

      }else return "FAILURE";
  }
}

module.exports = PlaceBlockNode;
