const { Node } = require("../behaviorTree");

class IdleNode extends Node {
  constructor() {
    super("IdleNode");
  }

  async tick(bot, state, config) {
    // If the bot is currently eating, execute defensive evasion
    if (state.isEating) {
      // Find the closest hostile mob (like a Blaze) trying to target us
      const hostileFilter = (e) => e.type === 'hostile' || e.name === 'blaze';
      const dangerousMob = bot.nearestEntity(hostileFilter);
      
      if (dangerousMob) {
        const dist = bot.entity.position.distanceTo(dangerousMob.position);
        
        // If a threat is within visual/firing range, look at it and strafe
        if (dist < 24) {
          // Look at the enemy to see fireballs coming
          bot.lookAt(dangerousMob.position.offset(0, 1.5, 0));
          
          // Randomly choose a side to strafe to throw off projectile aim
          const strafeDirection = Math.random() > 0.5 ? 'left' : 'right';
          
          bot.setControlState(strafeDirection, true);
          bot.setControlState('back', true); // Back away from danger
          bot.setControlState('jump', true); // Jump to make it harder for projectiles to hit
          
          // Clear keys quickly on the next tick interval to stay nimble
          setTimeout(() => {
            bot.setControlState(strafeDirection, false);
            bot.setControlState('back', false);
            bot.setControlState('jump', false);
          }, 250);
        }
      }
      return "RUNNING";
    }

    // Standard idle behavior when not eating
    bot.clearControlStates();
    return "SUCCESS";
  }
}

module.exports = IdleNode;
