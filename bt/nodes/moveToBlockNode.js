const { Node } = require("../behaviorTree");
const { goals } = require("mineflayer-pathfinder");
const { chatThrottled } = require("../../utils/throttle");

class MoveToBlockNode extends Node {
  constructor(
    stateKey = "blockTarget",
    nearDistance = 1,
    successDistance = 5,
    statusThrottleMs = 3000,
  ) {
    super("MoveToBlock");
    this.stateKey = stateKey;
    this.nearDistance = nearDistance;
    this.successDistance = successDistance;
    this.statusThrottleMs = statusThrottleMs;
    this.lastGoal = null;
  }

  async tick(bot, state) {
    const item = state["lootTarget"];
    if (item) return "SUCCESS";

    const target = state[this.stateKey];
    if (!target) {
      console.log("Nema targeta");
      this.lastGoal = null;
      return "FAILURE";
    }

    const block = bot.blockAt(target.position);
    if (block && block.name === "air" && !state["digTask"]) {
      state[this.stateKey] = null;
      this.lastGoal = null;
      return "FAILURE";
    }
    const dist = bot.entity.position.distanceTo(block.position);

    if (dist <= this.successDistance) {
      return "SUCCESS";
    }

    const goalX = Math.floor(block.position.x);
    const goalY = Math.floor(block.position.y);
    const goalZ = Math.floor(block.position.z);
    const goal = `${goalX}:${goalY}:${goalZ}`;

    if (this.lastGoal !== goal) {
      bot.pathfinder.setGoal(
        new goals.GoalNear(
          block.position.x,
          block.position.y,
          block.position.z,
          this.nearDistance,
        ),
      );

      this.lastGoal = goal;
    }

    chatThrottled(
      bot,
      `moveblock:${this.stateKey}:${goal}`,
      `Moving to ${block.name || "block"} @ ${Math.round(dist)} blocks`,
      this.statusThrottleMs,
    );

    return "RUNNING";
  }
}

module.exports = MoveToBlockNode;
