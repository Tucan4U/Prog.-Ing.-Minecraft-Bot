// Behavior Tree node responsible for ranged combat using bows/crossbows.
// Handles visibility checks, weapon/ammo validation, cooldowns,
// and safe ranged attack execution.

const { Node } = require('../behaviorTree');
const { hasLineOfSight } = require('../../utils/combatUtils');

class RangedAttackNode extends Node {
  constructor() {
    super("RangedAttackNode");

    // Timestamp of last successful shot
    this.lastShot = 0;

    // Delay between ranged attacks (ms)
    this.shotCooldown = 1500;
  }

  async tick(bot, state, config) {

    // Prevent attacking while eating
    if (state.isEating) {
      this.stop(bot);
      return "FAILURE";
    }

    const target = state.currentTarget;
    
    // Avoid ranged combat in unsafe liquid states
    if (bot.entity.isInLava || bot.entity.isInWater) {
        console.log("[RANGED] Unsafe liquid state.");
        return "FAILURE";
    }

    // Validate target existence and state
    if (!target || !target.isValid || target.health <= 0 || !bot.entities[target.id]) {
      this.stop(bot);

      // Clear invalid target reference
      state.currentTarget = null;

      return "SUCCESS";
    }

    // Stop melee combat systems before ranged attack
    if (bot.pvp?.target) {
      bot.pvp.stop();
    }

    // Stop pathfinding and movement
    bot.pathfinder.setGoal(null);
    bot.clearControlStates();

    // Calculate distance to target
    const dist = bot.entity.position.distanceTo(target.position);

    // Abort if target is too far away
    if (dist > 25) {
      return "FAILURE";
    }

    // Ensure target is visible
    if (!hasLineOfSight(bot, target)) {
      console.log("[RANGED] No line of sight.");
      return "FAILURE";
    }

    // Find ranged weapon in inventory
    const bow = bot.inventory.items().find(i =>
      config.RANGED_WEAPONS.includes(i.name)
    );

    if (!bow) {
      console.log("[RANGED] No bow.");
      return "FAILURE";
    }

    // Find ammunition in inventory
    const arrows = bot.inventory.items().find(i =>
      config.AMMO.includes(i.name)
    );

    if (!arrows) {
      console.log("[RANGED] No arrows.");
      return "FAILURE";
    }

    // Equip ranged weapon if not already held
    const held = bot.heldItem;

    if (!held || held.name !== bow.name) {
      await bot.equip(bow, "hand");
    }

    // Enforce attack cooldown
    if (Date.now() - this.lastShot < this.shotCooldown) {
      return "RUNNING";
    }

    try {

      console.log(`[RANGED] Shooting ${target.name}`);

      // Adjust pathfinder movement settings for combat
      const movements = bot.pathfinder.movements;

      if (movements) {
          movements.scafoldingBlocks = []; 
          movements.allow1by1towers = false;
      }
    
      // Aim slightly above target feet (toward torso/head)
      await bot.lookAt(target.position.offset(0, 1.6, 0), true);

      // Fire projectile using HawkEye plugin
      await bot.hawkEye.oneShot(target);

      // Clear target if it no longer exists
      if (!bot.entities[target.id]) {
        state.currentTarget = null;
      }

      // Update cooldown timer
      this.lastShot = Date.now();

    } catch (err) {

      console.log("[RANGED] Hawkeye error:", err.message);

      return "FAILURE";
    }

    return "RUNNING";
  }

  stop(bot) {

    // Stop all movement inputs
    bot.clearControlStates();

    // Stop melee combat if active
    if (bot.pvp?.target) {
      bot.pvp.stop();
    }

    // Clear active navigation goal
    bot.pathfinder.setGoal(null);

    // Restore normal movement/building abilities
    const movements = bot.pathfinder.movements;

    if (movements) {
        const config = require('../../config');

        // Restore scaffolding block list
        const logBlockIds = config.BLOCKS.LOGS.names
        .map(name => bot.registry.itemsByName[name]?.id)
        .filter(Boolean);

        movements.scafoldingBlocks = logBlockIds;
        movements.allow1by1towers = true;
    }
  }

}

module.exports = RangedAttackNode;