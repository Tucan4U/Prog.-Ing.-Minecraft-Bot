const { Node } = require("../behaviorTree");
const mcData = require("minecraft-data");
const Vec3 = require("vec3");

class CraftItemUsingTableNode extends Node {
  constructor(configKey, stateKey = "lootTarget") {
    super("CraftItemUsingTable");
    this.mcData = null;
    this.configKey = configKey; //name of the crafting item
    this.stateKey = stateKey;
  }

  async tick(bot, state, config) {
    //if (state.mission.craftedItems[this.configKey]) return "SUCCESS";
    if (!this.mcData) {
      this.mcData = mcData(bot.version);
    }

    let itemToCraftId = this.mcData.itemsByName[this.configKey]?.id;
    if (!itemToCraftId) {
      bot.chat("Item not found in data!");
      return "FAILURE";
    }

    const tableId = this.mcData.blocksByName.crafting_table.id;
    const table = bot.findBlock({
      matching: tableId,
      maxDistance: 6,
    });

    if (!table || table.name !== "crafting_table") {
      bot.chat("No crafting table found nearby.");
      return "FAILURE";
    }

    const recipe = bot.recipesFor(itemToCraftId, null, 1, table)[0];

    if (!recipe) {
      bot.chat("No recipe to craft item with this table.");
      return "FAILURE";
    }

    try {
      await bot.craft(recipe, 1, table);
      bot.chat("Crafted: ", this.configKey);
      //state.mission.craftedItems[this.configKey] = 1;
      return "SUCCESS";
    } catch (err) {
      bot.chat("Crafting failed: " + err.message);
      console.log("Crafting failed: ", err);
      return "FAILURE";
    }

    return "RUNNING";
  }
}

module.exports = CraftItemUsingTableNode;
