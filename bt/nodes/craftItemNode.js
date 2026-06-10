const { Node } = require("../behaviorTree");

class CraftItemNode extends Node {
  constructor(configKeyOrItems, numberOfItemsToCraft) {
    super("CraftItem");
    this.configKeyOrItems = configKeyOrItems;
    this.numberOfItemsToCraft = numberOfItemsToCraft;
    this.Recipe = null;
    this.mcData = null;
  }

  async tick(bot, state, config) {
    if (!this.Recipe)
      this.Recipe = require("prismarine-recipe")(bot.version).Recipe;
    if (!this.mcData) this.mcData = require("minecraft-data")(bot.version);
    if (!state.mission.craftedItems) {
      state.mission.craftedItems = {};
    }

    const desiredNames = Array.isArray(this.configKeyOrItems)
      ? this.configKeyOrItems
      : [this.configKeyOrItems];

    let targetCount = 1;
    if (typeof this.numberOfItemsToCraft === "function") {
      targetCount = this.numberOfItemsToCraft(bot, state, config) ?? 1;
    } else if (typeof this.numberOfItemsToCraft === "string") {
      targetCount = state.mission?.[this.numberOfItemsToCraft] ?? 1;
    } else {
      targetCount = this.numberOfItemsToCraft ?? 1;
    }

    for (const key in state.mission.craftedItems) {
      if (desiredNames.includes(key)) {
        if (state.mission.craftedItems[key] >= targetCount) {
          return "SUCCESS";
        }
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
      } else {
        console.log(this.Recipe.find(id)[0]);
        if (this.Recipe.find(id)[0].ingredients) {
          const missingItemId = this.Recipe.find(id)[0].ingredients[0].id;
          //console.log("Ingredients: ", missingItemId);
          console.log("Missing items: ", this.mcData[missingItemId]);
        }
        if (this.Recipe.find(id)[0].inShape) {
          const missingItemId = this.Recipe.find(id)[0].inShape[0][0].id;
          //console.log("In shape: ", missingItemId);
          console.log("Missing items: ", this.mcData.items[missingItemId].name);
        }
      }
    }

    // No recipe found for any desired items
    return "FAILURE";
  }
}

module.exports = CraftItemNode;
