const { Node } = require('../behaviorTree');
const mcData = require('minecraft-data');

// Locates a Nether fortress by searching for nether brick blocks within expanding rings.
// Once a cluster is found, stores the centroid as the fortress target.
class LocateFortressNode extends Node {
  constructor(maxSearchDistance = 512) {
    super('LocateFortress');
    this.maxSearchDistance = maxSearchDistance;
    this.currentSearchRadius = 64;
    this.mcData = null;
    this.reset();
  }

  reset() {
    this.completed = false;
    this.success = false;
  }

  async tick(bot, state) {
    if (!state.mission?.findFortressRequested) {
      return 'FAILURE';
    }

    if (!this.mcData) {
      this.mcData = mcData(bot.version);
    }

    // Get nether brick block IDs (supports all variants: regular, cracked, chiseled)
    const netherBrickIds = [
      this.mcData.blocksByName['nether_bricks']?.id,
      this.mcData.blocksByName['cracked_nether_bricks']?.id,
      this.mcData.blocksByName['chiseled_nether_bricks']?.id,
    ].filter(Boolean);

    if (!netherBrickIds.length) {
      bot.chat('Could not identify nether brick block types.');
      state.mission.findFortressRequested = false;
      this.reset();
      return 'FAILURE';
    }

    bot.chat(`Searching for fortress within ${this.currentSearchRadius} blocks...`);

    // Search for nether brick blocks within current search radius.
    // Found blocks are used to calculate the fortress centroid and pick a surface target.
    const bricks = bot.findBlocks({
      matching: netherBrickIds,
      maxDistance: this.currentSearchRadius,
      count: 50,
    });

    if (bricks.length > 0) {
      // Calculate centroid of found bricks and choose a top-level brick for surface targeting.
      // This ensures the bot aims for a walkable fortress surface (y+1), not the brick itself.
      let sumX = 0;
      let sumZ = 0;
      let maxY = Number.NEGATIVE_INFINITY;

      bricks.forEach((pos) => {
        sumX += pos.x;
        sumZ += pos.z;
        if (pos.y > maxY) {
          maxY = pos.y;
        }
      });

      const centroidX = sumX / bricks.length;
      const centroidZ = sumZ / bricks.length;
      const topCandidates = bricks.filter((pos) => pos.y >= maxY - 1);

      const bestBlock = topCandidates.reduce((best, pos) => {
        const dist = Math.hypot(pos.x - centroidX, pos.z - centroidZ);
        return !best || dist < best.dist ? { pos, dist } : best;
      }, null).pos;

      const fortressX = bestBlock.x;
      const fortressY = bestBlock.y + 1;
      const fortressZ = bestBlock.z;

      state.mission.fortressTarget = { x: fortressX, y: fortressY, z: fortressZ };
      bot.chat(`Fortress located at ${fortressX}, ${fortressY}, ${fortressZ}`);
      this.reset();
      return 'SUCCESS';
    }

    // Expand search radius if nothing found
    if (this.currentSearchRadius < this.maxSearchDistance) {
      this.currentSearchRadius = Math.min(this.maxSearchDistance, this.currentSearchRadius * 1.5);
      return 'RUNNING';
    }

    // Max search distance exceeded
    bot.chat(`Could not locate a fortress within ${this.maxSearchDistance} blocks.`);
    state.mission.findFortressRequested = false;
    state.mission.fortressTarget = null;
    this.reset();
    return 'FAILURE';
  }
}

module.exports = LocateFortressNode;
