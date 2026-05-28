const { Node } = require("../behaviorTree");
const { goals } = require("mineflayer-pathfinder");
const { equipBestWeapon } = require("../../utils/inventory");

function isCentered(bot, centerX, centerZ, tolerance = 0.2) {
  const pos = bot.entity.position;
  return Math.abs(pos.x - centerX) <= tolerance && Math.abs(pos.z - centerZ) <= tolerance;
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
    const centerX = Math.floor(bot.entity.position.x) + 0.5;
    const centerZ = Math.floor(bot.entity.position.z) + 0.5;

    // Prvi tick: zapamti početnu visinu i izračunaj ciljnu dubinu.
    if (state.pitStartY === null || state.pitTargetY === null) {
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