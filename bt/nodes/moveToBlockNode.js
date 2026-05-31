const { Node } = require("../behaviorTree");
const { goals } = require("mineflayer-pathfinder");
const { chatThrottled } = require("../../utils/throttle");

// Moves the bot toward a target block and detects stale or invalid paths.
class MoveToBlockNode extends Node {
  constructor(
    stateKey = "blockTarget",
    nearDistance = 3,
    successDistance = 5,
    statusThrottleMs = 3000,
  ) {
    super("MoveToBlock");
    this.stateKey = stateKey;
    this.nearDistance = nearDistance;
    this.successDistance = successDistance;
    this.statusThrottleMs = statusThrottleMs;
    this.lastGoal = null;
    this.lastDistance = null;
    this.lastProgressTime = null;
    this.stuckTimeoutMs = 10000;
  }

  async tick(bot, state) {
    const item = state["lootTarget"];
    if (item) {
      //console.log("Imamo lootTarget");
      return "SUCCESS";
    }

    const target = state[this.stateKey];
    if (!target) {
      // Fail if there is no current target block to move toward.
      console.log("Nema targeta");
      this.resetProgress();
      return "FAILURE";
    }

    const block = bot.blockAt(target.position);
    if (!block) {
      // Clear an invalid or disappeared block target and retry.
      state[this.stateKey] = null;
      this.resetProgress();
      return "FAILURE";
    }
    //This isn't the best solution and will maybe cause problems
    if (block.name === "air" && !state["digTask"]) {
      console.log("Ovo radi probleme");
      return "SUCCESS";
    }

    const dist = bot.entity.position.distanceTo(block.position);

    if (dist <= this.successDistance) {
      bot.pathfinder.setGoal(null);
      this.resetProgress();
      console.log("I'm near the target");
      return "SUCCESS";
    }

    //Success returned only after reaching successDistance, but we consider progress if we get within nearDistance
    if (this.lastDistance === null) {
      this.lastDistance = dist;
      this.lastProgressTime = Date.now();
    } else {
      const improved = dist < this.lastDistance - 0.5;

      if (improved) {
        this.lastDistance = dist;
        this.lastProgressTime = Date.now();
      } else if (Date.now() - this.lastProgressTime > this.stuckTimeoutMs) {
        // If the bot is stuck and not making progress, clear the target so it can search again.
        bot.chat(`Path stale for ${this.stateKey}. Retrying search.`);
        state[this.stateKey] = null;
        this.resetProgress();
        return "FAILURE";
      }
    }

    const goalX = Math.floor(block.position.x);
    const goalY = Math.floor(block.position.y);
    const goalZ = Math.floor(block.position.z);
    const goal = `${goalX}:${goalY}:${goalZ}`;

    if (this.lastGoal !== goal) {
      // Only update the pathfinder goal when the target block position changes.
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

  resetProgress() {
    this.lastGoal = null;
    this.lastDistance = null;
    this.lastProgressTime = null;
  }
}

module.exports = MoveToBlockNode;
