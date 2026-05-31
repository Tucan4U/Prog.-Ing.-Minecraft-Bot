const { Node } = require('../behaviorTree');
const { goals } = require('mineflayer-pathfinder');
const { chatThrottled } = require('../../utils/throttle');

class MoveToMobNode extends Node {
  constructor(stateKey = 'currentTarget', nearDistance = 2, successDistance = 3, statusThrottleMs = 3000) {
    super('MoveToMob');
    this.stateKey = stateKey;
    this.nearDistance = nearDistance;
    this.successDistance = successDistance;
    this.statusThrottleMs = statusThrottleMs;
    this.lastGoal = null;
  }

  async tick(bot, state) {
    const target = state[this.stateKey];

    if (!target) {
      this.lastGoal = null;
      return 'FAILURE';
    }

    if (!bot.entities[target.id]) {
      state[this.stateKey] = null;
      this.lastGoal = null;
      return 'FAILURE';
    }

    const dist = bot.entity.position.distanceTo(target.position);

    if (dist < this.successDistance) {
      return 'SUCCESS';
    }

    const goalX = Math.floor(target.position.x);
    const goalY = Math.floor(target.position.y);
    const goalZ = Math.floor(target.position.z);
    const goal = `${goalX}:${goalY}:${goalZ}`;

    if (this.lastGoal !== goal) {
      bot.pathfinder.setGoal(new goals.GoalNear(
        target.position.x,
        target.position.y,
        target.position.z,
        this.nearDistance
      ));

      this.lastGoal = goal;
    }

    chatThrottled(
      bot,
      `move:${this.stateKey}:${target.id}`,
      `Moving towards ${target.name} @ ${Math.round(dist)} blocks`,
      this.statusThrottleMs
    );

    return 'RUNNING';
  }
}

module.exports = MoveToMobNode;