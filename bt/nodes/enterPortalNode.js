const { Node } = require('../behaviorTree');

// Waits inside a Nether portal and detects when the bot changes dimension.
// This node handles portal timing, success detection, and failure fallback.
class EnterPortalNode extends Node {
  constructor(timeoutTicks = 200, targetDimension = 'the_nether') {
    super('EnterPortal');
    this.timeoutTicks = timeoutTicks; //how long to wait for the portal to work (4 seconds)
    this.targetDimension = targetDimension;
    this.task = null;
    this.startTick = null;
    this.feedbackSent = false;
    this.lastBlockTarget = null;
  }

  async tick(bot, state) {
    // Reset waiting state when a new portal target is assigned.
    if (state.blockTarget && state.blockTarget !== this.lastBlockTarget) {
      this.task = null;
      this.startTick = null;
      this.lastBlockTarget = state.blockTarget;
    }
    // If already in target dimension, success
    const currentDim = bot.game ? bot.game.dimension : null;
    const targetDim = this.targetDimension;

    const isSuccess = (targetDim === 'the_nether')
      ? (currentDim === 'the_nether')
      : (targetDim === 'overworld' ? (currentDim !== 'the_nether') : (currentDim === targetDim));

    if (bot.game && isSuccess) {
      if (targetDim === 'the_nether') {
        bot.chat('I have entered the Nether successfully!');
        state.mission.enterNetherRequested = false;
      } else {
        bot.chat('I have exited the Nether successfully!');
        state.mission.exitNetherRequested = false;
      }
      state.blockTarget = null;
      this.task = null;
      this.startTick = null;
      this.lastBlockTarget = null;
      return 'SUCCESS';
    }

    if (!this.task) {
      // Stop pathfinding and wait for the portal transition to occur.
      bot.pathfinder.setGoal(null);
      bot.chat('Entering portal...');
      this.startTick = Date.now();
      this.feedbackSent = false;
      
      this.task = (async () => {
        try {
          await bot.waitForTicks(this.timeoutTicks);
        } catch (err) {
          // ignore
        }
      })();
      return 'RUNNING';
    }

    // Check if waiting task finished
    const elapsedMs = Date.now() - this.startTick;
    const hasTimedOut = elapsedMs >= (this.timeoutTicks * 50); // rough tick to ms conversion

    if (hasTimedOut) {
      // Timeout reached: confirm whether the portal transition succeeded.
      if (bot.game && isSuccess) {
        if (!this.feedbackSent) {
          if (targetDim === 'the_nether') {
            bot.chat('I have entered the ' + targetDim + ' successfully!');
            state.mission.enterNetherRequested = false;
          } else {
            bot.chat('I have exited the Nether successfully!');
            state.mission.exitNetherRequested = false;
          }
          this.feedbackSent = true;
          state.blockTarget = null;
        }
        return 'SUCCESS';
      } else {
        if (!this.feedbackSent) {
          bot.chat('Error: Portal transition failed. Dimension unchanged.');
          this.feedbackSent = true;
          state.blockTarget = null;
        }
        this.task = null;
        this.startTick = null;
        this.lastBlockTarget = null;
        return 'FAILURE';
      }
    }

    // Still waiting
    return 'RUNNING';
  }
}

module.exports = EnterPortalNode;

