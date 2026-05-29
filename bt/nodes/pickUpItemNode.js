const { Node } = require("../behaviorTree");
const { goals } = require("mineflayer-pathfinder");
const { findItem } = require("../../behaviors/loot");

// Prima listu itema iz configa ili direktan array itema koje treba pokupiti, traži ih u svijetu i ide prema njima.
// Kad je dovoljno blizu, vraća SUCCESS da se može pokupiti.
class PickUpItemNode extends Node {
  constructor(configKeyOrItems) {
    super("PickUpItemNode");
    this.configKeyOrItems = configKeyOrItems;
  }
  async tick(bot, state, config) {
    await new Promise((r) => setTimeout(r, 500));
    const itemsCache = state.sensors?.items;
    const items = Array.isArray(this.configKeyOrItems)
      ? this.configKeyOrItems
      : config?.[this.configKeyOrItems];

    const item = findItem(bot, items, itemsCache);
    console.log("PickupItemNode looking for items:", items, "Found:", item);
    if (!item) {
      state["lootTarget"] = null; //Ovo koriste findBlockNode, moveToBlockNode, breakLogNode
      return "FAILURE";
    }

    state.lootTarget = item;

    bot.pathfinder.setGoal(
      new goals.GoalBlock(item.position.x, item.position.y, item.position.z),
    );

    const dist = bot.entity.position.distanceTo(item.position);

    if (dist < 1.5) {
      state.lootTarget = null;
      return "SUCCESS";
    }

    return "RUNNING";
  }
}

module.exports = PickUpItemNode;
