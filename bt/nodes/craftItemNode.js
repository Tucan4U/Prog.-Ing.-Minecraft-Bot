const { Node } = require("../behaviorTree");

class CraftItemNode extends Node {
  constructor(configKeyOrItems) {
    super("CraftItem");
    this.configKeyOrItems = configKeyOrItems;
    this.isCrafting = null;
  }

  async tick(bot, state, config) {
    const items = this.configKeyOrItems
      .map((name) => bot.registry.itemsByName[name]?.id)
      .filter((id) => id !== undefined);

    items.forEach(async (id) => {
      const recipe = bot.recipesFor(id, null, 1);
      if (recipe.length > 0 && !this.isCrafting) {
        console.log(recipe[0]);
        this.isCrafting = bot
          .craft(recipe[0], 1, null)
          .then(() => {
            this.isCrafting = null;
            bot.chat("I crafted:");
            console.log(
              "Ovdje se ne prikazuje puno:",
              bot.registry.items[recipe[0].result.id]?.displayName,
            );
            return "SUCCESS";
          })
          .catch((e) => {
            console.log("Error crafting item: ", e);
            return "FAILURE";
          });
      } else {
        console.log("No recipe found or not enough materials");
      }
    });
    return "RUNNING";
  }
}

module.exports = CraftItemNode;
