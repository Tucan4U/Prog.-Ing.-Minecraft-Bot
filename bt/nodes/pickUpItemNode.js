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

    if (!item && state.lootTarget) {
      state["lootTarget"] = null;
      state["blockTarget"] = null;
      return "SUCCESS";
    }

    if (!item) {
      //Ovo koriste findBlockNode, moveToBlockNode, breakLogNode
      state["lootTarget"] = null;
      return "FAILURE";
    }

    state.lootTarget = item;

    bot.pathfinder.setGoal(
      new goals.GoalBlock(item.position.x, item.position.y, item.position.z),
    );

    return "RUNNING";
  }
}

module.exports = PickUpItemNode;
