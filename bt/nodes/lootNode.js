const { Node } = require("../behaviorTree");
const { goals } = require("mineflayer-pathfinder");
const { findItem } = require("../../behaviors/loot");

// za sada radi samo sa hranon, treba proširit na drugi loot (npr. iteme koje dropaju mobovi)
class LootNode extends Node {
  constructor(typeOfLoot) {
    super("LootNode");
    this.typeOfLoot = typeOfLoot;
    this.lastGoal = null;
  }
  async tick(bot, state, config) {
    const item = findItem(bot, config[this.typeOfLoot]);
    if (!item) return "FAILURE";

    state.lootTarget = item;

    const goal = `${item.position.x}:${item.position.y}:${item.position.z}`;

    if (this.lastGoal !== goal) {
      bot.pathfinder.setGoal(
        new goals.GoalBlock(item.position.x, item.position.y, item.position.z),
      );
      this.lastGoal = goal;
    }

    const dist = bot.entity.position.distanceTo(item.position);

    if (dist < 1.5) {
      state.lootTarget = null;
      return "SUCCESS";
    }

    return "RUNNING";
  }
}

module.exports = LootNode;
