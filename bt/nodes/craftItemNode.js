const { Node } = require("../behaviorTree");

class CraftItemNode extends Node {
  constructor(configKeyOrItems, numberOfItemsToCraft) {
    super("CraftItem");
    this.configKeyOrItems = configKeyOrItems;
    this.isCrafting = null;
    this.numberOfItemsToCraft = numberOfItemsToCraft;
  }

  async tick(bot, state, config) {
    if (!state.mission.craftedItems) {
      state.mission.craftedItems = {};
    }

    const desiredNames = Array.isArray(this.configKeyOrItems)
      ? this.configKeyOrItems
      : [this.configKeyOrItems];
    const targetCount = this.numberOfItemsToCraft ?? 1;
    for (const key in state.mission.craftedItems) {
      if (desiredNames.includes(key)) {
        if (state.mission.craftedItems[key] >= targetCount) return "SUCCESS";
      }
    }
    console.log(
      "This is being logged in the: ",
      desiredNames,
      "Object values: ",
      Object.values(state.mission.craftedItems),
    );
    // If a craft operation is already in progress, wait for it to finish.
    if (this.isCrafting) return "RUNNING";

    // Try to find a recipe for any of the desired items and start crafting once.
    for (const name of desiredNames) {
      const id = bot.registry.itemsByName[name]?.id;
      if (id === undefined) continue;

      const recipe = bot.recipesFor(id, null, 1);
      if (recipe.length > 0) {
        console.log("Found recipe for", name, recipe[0]);
        this.isCrafting = bot
          .craft(recipe[0], 1, null)
          .then(() => {
            this.isCrafting = null;
            if (!state.mission.craftedItems[name])
              state.mission.craftedItems[name] = 0;
            state.mission.craftedItems[name] += recipe[0].result.count;
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
            this.isCrafting = null;
          });

        return "RUNNING";
      }
    }

    // No recipe found for any desired items
    return "FAILURE";
  }
}

module.exports = CraftItemNode;
