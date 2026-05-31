const { Node } = require('../behaviorTree');
const { goals } = require('mineflayer-pathfinder');

// Long-distance travel to Nether fortress using relay-step pathfinding.
// Breaks the journey into manageable steps to avoid pathfinder crashes on distant goals.
// Uses fortress surface height (y coordinate) to reach the walkable level, not void.
class MoveToFortressNode extends Node {
  constructor(stepDistance = 400, arrivalDistance = 5, waitTicks = 20) {
    super('MoveToFortress');
    this.stepDistance = stepDistance;
    this.arrivalDistance = arrivalDistance;
    this.waitTicks = waitTicks;
    this.currentTask = null;
  }

  reset() {
    this.currentTask = null;
  }

  async tick(bot, state) {
    // Fail if fortress search was not requested or has been cleared.
    if (!state.mission?.findFortressRequested) {
      return 'FAILURE';
    }

    const target = state.mission.fortressTarget;
    if (!target) {
      return 'FAILURE';
    }

    const currentPos = bot.entity.position;
    const dx = target.x - currentPos.x;
    const dz = target.z - currentPos.z;
    const dy = (target.y ?? currentPos.y) - currentPos.y;
    // Calculate 3D distance including height so arrival check works correctly.
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance <= this.arrivalDistance) {
      bot.chat('I arrived at the fortress!');
      state.mission.findFortressRequested = false;
      state.mission.fortressTarget = null;
      this.reset();
      return 'SUCCESS';
    }

    if (this.currentTask) {
      return 'RUNNING';
    }

    const distance2d = Math.sqrt(dx * dx + dz * dz);
    // Calculate relay step: move up to stepDistance blocks toward the fortress.
    // If bot is directly below/above, ratio becomes 1 and moves to final target.
    const ratio = distance2d === 0 ? 1 : Math.min(1, this.stepDistance / distance2d);
    const nextX = currentPos.x + dx * ratio;
    const nextZ = currentPos.z + dz * ratio;
    // Use target.y (fortress surface level) to ensure pathfinder aims at the walking surface.
    const nextY = target.y ?? Math.floor(currentPos.y);

    const goal = new goals.GoalNear(nextX, nextY, nextZ, 2);
    this.currentTask = bot.pathfinder.goto(goal);

    try {
      await this.currentTask;
      await bot.waitForTicks(this.waitTicks);
    } catch (err) {
      bot.chat(`Travel error: ${err.message}`);
      state.mission.findFortressRequested = false;
      state.mission.fortressTarget = null;
      this.reset();
      return 'FAILURE';
    }

    this.reset();
    return 'RUNNING';
  }
}

module.exports = MoveToFortressNode;
