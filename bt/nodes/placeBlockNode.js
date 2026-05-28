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

    //let blockToPlaceId = this.mcData.itemsByName[this.configKey]?.id;
    const blockItem = bot.inventory.items().find(i => i.name === this.configKey); //bolje preko imena jer config može imati i array imena, a i ne mora biti u inventoryju
    let blockAbove = state[this.stateKey];
    if (!blockAbove || !blockAbove.position) {
      return "FAILURE";
    }

    // If we've already placed the furnace during this workflow, don't place again.
    if (state.furnacePlaced) {
      return "SUCCESS";
    }

    const existingBlock = bot.blockAt(blockAbove.position);
    if (existingBlock && existingBlock.name === this.configKey) {
      // mark placed in state so subsequent ticks short-circuit
      state.furnacePlaced = true;
      return "SUCCESS";
    }

    //bot.chat(`${this.configKey}`);
    //bot.chat(`${blockToPlaceId}`);
    let blockBelow = bot.blockAt(blockAbove.position.offset(0, -1, 0));

    try{
        await bot.equip(blockItem, "hand");
    }catch (err) {
        console.log("No block in inventory:", err);
        bot.chat("No block in inventory");
        return "FAILURE";
    }
    

    if (blockAbove && blockBelow && blockAbove.name === "air" && blockBelow.name !== "air") {
        try {  
            await bot.placeBlock(blockBelow, new Vec3(0, 1, 0));
          } catch (err) {
            console.log("Error placing block:", err);
            bot.chat("Error placing block");
          }
          let newBlock = bot.blockAt(blockAbove.position);
          if (newBlock && newBlock.name === this.configKey) {
            state.furnacePlaced = true;
            return "SUCCESS";
          } else return "FAILURE";

      }else return "FAILURE";
  }
}

module.exports = PlaceBlockNode;
