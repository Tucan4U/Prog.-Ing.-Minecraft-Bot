const { Node } = require("../behaviorTree");

class CraftItemNode extends Node {
  constructor(configKeyOrItems, numberOfItemsToCraft) {
    super("CraftItem");
    this.configKeyOrItems = configKeyOrItems;
    this.numberOfItemsToCraft = numberOfItemsToCraft;
  }

  async tick(bot, state, config) {
    if (!state.craftedItems) {
      state.craftedItems = {};
    }

    const desiredNames = Array.isArray(this.configKeyOrItems)
      ? this.configKeyOrItems
      : [this.configKeyOrItems];
    const targetCount = this.numberOfItemsToCraft ?? 1;
    for (const key in state.craftedItems) {
      if (desiredNames.includes(key)) {
        if (state.craftedItems[key] >= targetCount) return "SUCCESS";
      }
    }
    console.log(
      "This is being logged in the: ",
      desiredNames,
      "Object values: ",
      Object.values(state.craftedItems),
    );
    // If a craft operation is already in progress, wait for it to finish.
    if (state.isCrafting) return "RUNNING";

    // Try to find a recipe for any of the desired items and start crafting once.
    for (const name of desiredNames) {
      const id = bot.registry.itemsByName[name]?.id;
      if (id === undefined) continue;

      const recipe = bot.recipesFor(id, null, 1);
      if (recipe.length > 0) {
        console.log("Found recipe for", name, recipe[0]);
        state.isCrafting = bot
          .craft(recipe[0], 1, null)
          .then(() => {
            state.isCrafting = null;
            if (!state.craftedItems[name])
              state.craftedItems[name] = 0;
            state.craftedItems[name] += recipe[0].result.count;
            console.log(
              "Bot crafted: ",
              bot.registry.items[recipe[0].result.id]?.displayName,
            );
            // bot.chat(
            //   "I crafted: ",
            //   bot.registry.items[recipe[0].result.id]?.displayName,
            // );
          })
          .catch((e) => {
            console.log("Error crafting item: ", e);
            state.isCrafting = null;
          });

        return "RUNNING";
      }
    }

    // No recipe found for any desired items
    return "FAILURE";
  }
}

module.exports = CraftItemNode;
