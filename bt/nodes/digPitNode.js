const { Node } = require("../behaviorTree");
const { goals } = require("mineflayer-pathfinder");
const { equipBestWeapon } = require("../../utils/inventory");
const Vec3 = require('vec3').Vec3 || require('vec3');

function isCentered(bot, centerX, centerZ, tolerance = 0.2) {
  const pos = bot.entity.position;
  return Math.abs(pos.x - centerX) <= tolerance && Math.abs(pos.z - centerZ) <= tolerance;
}

function isUnsafeBlock(block) {
  if (!block || !block.name) return true;
  const name = block.name.toLowerCase();
  if (name.includes('air')) return true;
  if (name.includes('lava')) return true;
  if (name.includes('water')) return true;
  return false;
}

function isSafeLocation(bot, centerX, centerZ, startY, depth) {
  // Check each level from just below bot down to target depth
  for (let d = 1; d <= depth; d++) {
    const y = startY - d;
    // check 3x3 area centered on (centerX, centerZ) at this level
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const bx = Math.floor(centerX) + dx;
        const bz = Math.floor(centerZ) + dz;
        const blk = bot.blockAt(new Vec3(bx, y, bz));
        if (isUnsafeBlock(blk)) return false;
      }
    }
  }

  return true;
}

function findNearestSafeLocation(bot, startX, startZ, startY, depth, initialRadius = 6, maxRadius = 24, step = 6) {
  const originX = Math.floor(startX) + 0.5;
  const originZ = Math.floor(startZ) + 0.5;

  if (isSafeLocation(bot, originX, originZ, startY, depth)) {
    return { x: originX, z: originZ };
  }

  for (let radius = initialRadius; radius <= maxRadius; radius += step) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== radius) continue; // perimeter
        const cx = Math.floor(startX) + dx + 0.5;
        const cz = Math.floor(startZ) + dz + 0.5;
        if (isSafeLocation(bot, cx, cz, startY, depth)) {
          return { x: cx, z: cz };
        }
      }
    }
  }

  return null;
}

function resolveToolConfigKey(blockName) {
  const name = (blockName || "").toLowerCase();

  if (
    name.includes("dirt") ||
    name.includes("gravel") ||
    name.includes("sand") ||
    name.includes("clay") ||
    name.includes("snow") ||
    name.includes("farmland") ||
    name.includes("grass") ||
    name.includes("podzol") ||
    name.includes("mycelium")
  ) {
    return "SHOVELS";
  }

  return "PICKAXES";
}

/**
 * digPitNode
 *
 * Svrha:
 * - Iskopa vertikalnu rupu duboku N blokova ispod trenutne pozicije bota.
 * - Node je stateful: pamti početnu Y koordinatu i ciljnu dubinu u `state`.
 * - Svaki tick kopa jedan blok ispod bota dok bot ne stigne do ciljne dubine.
 *
 * Tipična upotreba za ovaj projekt:
 * - `new DigPitNode(3)` znači: iskopaj rupu 3 bloka ispod bota.
 *
 * State (modificira):
 * - `state.pitDigTask` = aktivni promise iz `bot.dig(...)`
 * - `state.pitStartY` = početna Y koordinata bota
 * - `state.pitTargetY` = Y koordinata do koje trebamo doći
 */
class DigPitNode extends Node {
  constructor(depth = 3) {
    super("DigPit");
    this.depth = depth;
    this.lastCenterGoal = null;
  }

  async tick(bot, state, config) {
    const currentY = Math.floor(bot.entity.position.y);
    const centerX = state.pitTargetCenterX ?? (Math.floor(bot.entity.position.x) + 0.5);
    const centerZ = state.pitTargetCenterZ ?? (Math.floor(bot.entity.position.z) + 0.5);

    // Prvi tick: zapamti početnu visinu i izračunaj ciljnu dubinu.
    if (state.pitStartY === null || state.pitTargetY === null) {
      // Before starting, verify location safety through the whole depth.
      const desiredStartY = currentY;
      const desiredDepth = this.depth;

      const safeHere = isSafeLocation(bot, centerX, centerZ, desiredStartY, desiredDepth);
      if (!safeHere) {
        const found = findNearestSafeLocation(bot, bot.entity.position.x, bot.entity.position.z, desiredStartY, desiredDepth, 6, 24, 6);
        if (found) {
          state.pitTargetCenterX = found.x;
          state.pitTargetCenterZ = found.z;
          bot.chat(`Unsafe dig location detected; moving to safe position ${found.x.toFixed(1)}, ${found.z.toFixed(1)}.`);
          bot.pathfinder.setGoal(new goals.GoalNear(found.x, currentY, found.z, 0.5));
          return "RUNNING";
        }

        bot.chat("Unsafe dig location and no nearby safe spot found. Aborting.");
        return "FAILURE";
      }

      state.pitStartY = currentY;
      state.pitTargetY = currentY - this.depth;
      bot.chat(`Digging pit: currentY=${currentY}, targetY=${state.pitTargetY}`);
    }
    
    // Ako smo već dovoljno duboko, očisti state i završi.
    if (currentY <= state.pitTargetY) {
      state.pitDigTask = null;
      state.pitStartY = null;
      state.pitTargetY = null;
      this.lastCenterGoal = null;
      state.pitTargetCenterX = null;
      state.pitTargetCenterZ = null;
      state.inPit = true; // opcionalno označi da smo u rupi, može koristiti drugi node za izlazak iz nje kasnije
      console.log("[DigPit] SUCCESS");
      bot.chat("Finished digging pit!");
      return "SUCCESS";
    }

    // 1) Prvo se centriraj na trenutni blok prije kopanja.
    if (!isCentered(bot, centerX, centerZ)) {
      const goal = `${centerX}:${currentY}:${centerZ}`;

      if (this.lastCenterGoal !== goal) {
        bot.pathfinder.setGoal(new goals.GoalNear(centerX, currentY, centerZ, 0.4));
        this.lastCenterGoal = goal;
        console.log(`[DigPit] centering to ${goal}`);
      }

      console.log(`[DigPit] RUNNING centering currentY=${currentY} targetY=${state.pitTargetY}`);
      return "RUNNING";
    }

    // Blok direktno ispod bota.
    const blockBelow = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (!blockBelow) {
      bot.chat("No block below? This shouldn't happen. Failing.");
      return "FAILURE";
    }


    // Ako je ispod već air, znači da bot pada ili se već otvorila rupa;
    // u tom slučaju samo čekamo da physics i sljedeći tick odrade svoje.
    if (blockBelow.name === "air") {
      console.log(`[DigPit] RUNNING currentY=${currentY} targetY=${state.pitTargetY} task=none (air below)`);
      return "RUNNING";
    }


    if (!state.inPit) {
        if (state.pitDigTask) { //OVO moramo ovako napravi jer bot.dig() vraća promise koji se resolvea kad je kopanje gotovo, a mi ne želimo pokrenuti novi dig dok je stari još u tijeku
            return "RUNNING";
        }else {
            const toolConfigKey = resolveToolConfigKey(blockBelow.name);
            bot.pathfinder.setGoal(null);

            await equipBestWeapon(bot, config[toolConfigKey] || []);

            console.log(`[DigPit] digging ${blockBelow.name} with ${toolConfigKey}`);

            state.pitDigTask = bot.dig(blockBelow).catch((err) => {
            console.error("Dig error:", err);
            state.pitDigTask = null;
            }).then(() => {
            console.log(`[DigPit] dig finished at y=${currentY}`);
            bot.chat(`Finished digging block at y=${currentY}...`);
            state.pitDigTask = null;
            });
            return "RUNNING";
        }
    }

    const blockInFront = bot.blockAt(bot.entity.position.offset(1, 1, 0));
    state.blockTarget = blockInFront; //OVO OSTAJE NAKON I NE ČISTI SE!!

    if(blockInFront && blockInFront.name !== "air" && blockInFront.name !== "furnace") {
        if (state.pitDigTask) {
            return "RUNNING";
        }else {
            const toolConfigKey = resolveToolConfigKey(blockBelow.name);
            bot.pathfinder.setGoal(null);
            await equipBestWeapon(bot, config[toolConfigKey] || []);
            state.pitDigTask = bot.dig(blockInFront).catch((err) => {
                console.error("Digggg error:", err);
                state.pitDigTask = null;
            }).then(() => {state.pitDigTask = null;});
            
            return "RUNNING";
        }
    }

    return "SUCCESS"; // ako smo već u rupi, možemo signalizirati da je posao gotov (ili koristiti drugi node za izlazak iz rupe)
  }
}

module.exports = DigPitNode;