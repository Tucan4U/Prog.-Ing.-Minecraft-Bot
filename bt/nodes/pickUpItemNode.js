const { Node } = require("../behaviorTree");
const { goals } = require("mineflayer-pathfinder");
const { findItem } = require("../../behaviors/loot");

// Prima listu itema iz configa ili direktan array itema koje treba pokupiti, traži ih u svijetu i ide prema njima.
// Kad je dovoljno blizu, vraća SUCCESS da se može pokupiti.
class PickUpItemNode extends Node {
  constructor(configKeyOrItems) {
    super("PickUpItemNode");
    this.configKeyOrItems = configKeyOrItems;
    this.lastGoal = null;
    this.lastBotPosition = null;
    this.lastProgressTime = null;
    this.stuckTimeoutMs = 5000;
  }
  async tick(bot, state, config) {
    //await new Promise((r) => setTimeout(r, 500));
    const itemsCache = state.sensors?.items;
    const items = Array.isArray(this.configKeyOrItems)
      ? this.configKeyOrItems
      : config?.[this.configKeyOrItems];

    const item = findItem(bot, items, itemsCache);

    if (!item && state.lootTarget) {
      state["lootTarget"] = null;
      state["blockTarget"] = null;
      this.resetProgress();
      return "SUCCESS";
    }

    if (!item) {
      //Ovo koriste findBlockNode, moveToBlockNode, breakLogNode
      state["lootTarget"] = null;
      this.resetProgress();
      return "FAILURE";
    }

    state.lootTarget = item;

    const botPosition = bot.entity.position.clone();
    if (this.lastBotPosition === null) {
      this.lastBotPosition = botPosition;
      this.lastProgressTime = Date.now();
    } else {
      const moved = botPosition.distanceTo(this.lastBotPosition) > 0.5;

      if (moved) {
        this.lastBotPosition = botPosition;
        this.lastProgressTime = Date.now();
      } else if (Date.now() - this.lastProgressTime > this.stuckTimeoutMs) {
        bot.chat("PickUpItemNode path stale. Retrying search.");
        bot.pathfinder.setGoal(null);
        state.lootTarget = null;
        this.resetProgress();
        return "FAILURE";
      }
    }

    const goalX = Math.floor(item.position.x);
    const goalY = Math.floor(item.position.y);
    const goalZ = Math.floor(item.position.z);
    const goal = `${goalX}:${goalY}:${goalZ}`;

    if (this.lastGoal !== goal) {
      // Only update the pathfinder goal when the target block position changes.
      bot.pathfinder.setGoal(
        new goals.GoalBlock(item.position.x, item.position.y, item.position.z),
      );

      this.lastGoal = goal;
      this.lastBotPosition = botPosition;
      this.lastProgressTime = Date.now();
    }

    return "RUNNING";
  }

  resetProgress() {
    this.lastGoal = null;
    this.lastBotPosition = null;
    this.lastProgressTime = null;
  }
}

module.exports = PickUpItemNode;
