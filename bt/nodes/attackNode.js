const { Node } = require('../behaviorTree');
const { equipBestWeapon } = require('../../utils/inventory');
const { attackTarget } = require('../../behaviors/combat');

class AttackNode extends Node {
  constructor() {
    super("AttackNode");
  }

  async tick(bot, state, config) {
    // 1. Safety check for eating
    if (state.isEating || bot.autoEat?.isEating) {
      if (bot.pvp?.target) {
        bot.pvp.stop(); // Stop PvP if we are eating
      }
      console.log("[COMBAT] Trenutno jedem, pauziram borbu.");
      return "FAILURE"; // We go into idleNode
    }

    const target = state.currentTarget;

    // 2. Separate Target Validations
    if (!target) {
      console.log("[COMBAT] No active target (Target is null).");
      this.stopCombat(bot, state);
      return "SUCCESS";
    }

    // Check 2: Target isValid flag (added by PvP plugin) - if false, it means the target is no longer valid for combat
    if (!target.isValid) {
      console.log("[COMBAT] No longer a valid target (target.isValid is false).");
      this.stopCombat(bot, state);
      return "SUCCESS";
    }

    // Check 3: Target is dead (health at zero or below)
    if (target.health <= 0) {
      console.log(`[COMBAT] Target ${target.name} is dead.`);
      this.stopCombat(bot, state);
      return "SUCCESS";
    }

    // Check 4: GHOST BUG protection - target does not exist in bot's field of view (entities list)
    if (!bot.entities[target.id]) {
      console.log(`[COMBAT] Target ${target.name} is not in sight (ghost bug protection).`);
      this.stopCombat(bot, state);
      return "SUCCESS";
    }

    // 3. Dynamic Combat Activation & Weapon Verification
    const heldItem = bot.inventory.slots[bot.getEquipmentDestSlot('hand')];
    const isHoldingWeapon = heldItem && config.WEAPONS.includes(heldItem.name);

    if (bot.pvp.target !== target || !isHoldingWeapon) {
      // Close main pathfinder if it's still active, so it doesn't interfere with PvP movement
      if (bot.pathfinder.goal) {
        bot.pathfinder.setGoal(null); 
      }

      if (!isHoldingWeapon) {
        const itemLogName = heldItem ? heldItem.name : "empty hand";
        console.log(`[COMBAT] Bot is holding ${itemLogName} which is not a weapon. Equipping best weapon before attacking.`);
      }

      // Equip best weapon from config before attacking
      await equipBestWeapon(bot, config.WEAPONS);

      console.log(`[COMBAT] Initiating attack on: ${target.name}`);
      attackTarget(bot, target); // Leave control to PvP plugin for movement and attacking logic
    }

    return "RUNNING";
  }

  // Helper function to cleanly stop combat and reset current target state
  stopCombat(bot, state) {
    if (bot.pvp?.target) {
      bot.pvp.stop();
    }
    state.currentTarget = null;
  }
}

module.exports = AttackNode;