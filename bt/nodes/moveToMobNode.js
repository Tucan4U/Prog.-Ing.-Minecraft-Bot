const { Node } = require("../behaviorTree");
const { goals } = require("mineflayer-pathfinder");
const { chatThrottled } = require("../../utils/throttle");

class MoveToMobNode extends Node {
  constructor(
    stateKey = "currentTarget",
    nearDistance = 1,
    successDistance = 2,
    statusThrottleMs = 3000,
    goalRetryMs = 3000,
    stuckTimeoutMs = 5000
  ) {
    super("MoveToMob");

    this.stateKey = stateKey;
    this.nearDistance = 1;
    this.successDistance = 2;
    this.statusThrottleMs = statusThrottleMs;

    this.goalRetryMs = goalRetryMs;
    this.stuckTimeoutMs = stuckTimeoutMs;

    this.lastGoal = null;
    this.lastGoalSetTime = 0;

    this.lastDistance = Infinity;
    this.lastProgressTime = Date.now();
  }

  reset(bot) {
    bot.pathfinder.setGoal(null);
    this.lastGoal = null;
    this.lastGoalSetTime = 0;
    this.lastDistance = Infinity;
    this.lastProgressTime = Date.now();
  }

  async tick(bot, state) {
    const target = state[this.stateKey];

    //
    // Nema targeta
    //
    if (!target) {
      this.reset(bot);
      return "FAILURE";
    }

    //
    // Target više ne postoji
    //
    if (!bot.entities[target.id]) {
      state[this.stateKey] = null;
      this.reset(bot);
      return "FAILURE";
    }

    const currentTarget = bot.entities[target.id];
    const dist = bot.entity.position.distanceTo(currentTarget.position);

    //
    // Stigli smo do mete
    //
    if (dist < this.successDistance) {
      this.reset(bot);
      return "SUCCESS";
    }

    const now = Date.now();

    //
    // Progress detection
    //
    if (dist < this.lastDistance - 0.5) {
      this.lastDistance = dist;
      this.lastProgressTime = now;
    }

    const goalX = Math.floor(currentTarget.position.x);
    const goalY = Math.floor(currentTarget.position.y);
    const goalZ = Math.floor(currentTarget.position.z);

    const goalKey = `${goalX}:${goalY}:${goalZ}`;

    const retryGoal =
      now - this.lastGoalSetTime > this.goalRetryMs;

    const stuck =
      now - this.lastProgressTime > this.stuckTimeoutMs;

    //
    // Novi goal ili retry
    //
    if (
      this.lastGoal !== goalKey ||
      retryGoal ||
      stuck
    ) {
      if (stuck) {
        console.log(
          `[MoveToMob] No progress for ${
            Math.round((now - this.lastProgressTime) / 1000)
          }s, retrying path`
        );
      }

      bot.pathfinder.setGoal(
        new goals.GoalNear(
          currentTarget.position.x,
          currentTarget.position.y,
          currentTarget.position.z,
          this.nearDistance
        )
      );

      this.lastGoal = goalKey;
      this.lastGoalSetTime = now;

      if (stuck) {
        this.lastProgressTime = now;
      }
    }

    chatThrottled(
      bot,
      `move:${this.stateKey}:${currentTarget.id}`,
      `Moving towards ${currentTarget.name} @ ${Math.round(dist)} blocks`,
      this.statusThrottleMs
    );

    return "RUNNING";
  }
}

module.exports = MoveToMobNode;
