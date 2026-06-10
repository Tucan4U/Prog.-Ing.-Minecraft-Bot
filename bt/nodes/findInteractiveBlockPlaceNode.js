const { Node } = require("../behaviorTree");
const { equipBestWeapon } = require("../../utils/inventory");

class FindInteractiveBlockPlacementNode extends Node {
  constructor(stateKey = "blockTarget", placementDistance = 2) {
    super("FindInteractiveBlockPlacement");
    this.stateKey = stateKey;
    this.placementDistance = placementDistance;
    //this.tools = tools;
  }

  async tick(bot, state, config) {
    const botPos = bot.entity.position.floored();

    const isAir = (block) => !block || block.name.includes("air");
    const isSolid = (block) => block && !block.name.includes("air");

    // 1) Pit check: if block 3 below is air and has at least one solid neighbor,
    // treat that spot as interactive placement target.
    const pitCheckPos = botPos.offset(0, 3, 0);
    const pitBlock = bot.blockAt(pitCheckPos);
    if (isAir(pitBlock)) {
      const horizontal = [
        pitCheckPos.offset(1, 0, 0),
        pitCheckPos.offset(-1, 0, 0),
        pitCheckPos.offset(0, 0, 1),
        pitCheckPos.offset(0, 0, -1),
      ];

      const hasSolidAroundPit = horizontal.some((pos) =>
        isSolid(bot.blockAt(pos)),
      );

      if (hasSolidAroundPit) {
        bot.chat(`Pit interactive target at ${pitCheckPos}`);
        state[this.stateKey] = pitBlock;
        return "SUCCESS";
      }
    }

    //2) If bot stands on isolated dirt-like support block, dig it and retry next tick.
    const supportPos = botPos.offset(0, -1, 0);
    const supportBlock = bot.blockAt(supportPos);

    const isSolidLike =
      supportBlock &&
      (!supportBlock.name.includes("air") ||
        !supportBlock.name.includes("water"));

    if (isSolidLike) {
      const aroundSupport = [
        supportPos.offset(1, 0, 0),
        supportPos.offset(-1, 0, 0),
        supportPos.offset(0, 0, 1),
        supportPos.offset(0, 0, -1),
      ];

      const allAroundAir = aroundSupport.every((pos) =>
        isAir(bot.blockAt(pos)),
      );

      if (allAroundAir) {
        try {
          bot.pathfinder.setGoal(null);
          await bot.dig(supportBlock);
          state[this.stateKey] = null;
          state.interactiveBlock = null;
          bot.chat(
            "Dug isolated support block, retrying interactive placement.",
          );
          return "FAILURE";
        } catch (err) {
          console.log("Failed to dig isolated support block:", err);
          return "FAILURE";
        }
      }
    }

    const block = state[this.stateKey];
    if (block) {
      // const blockBelow = bot.blockAt(block?.position.offset(0, -1, 0));

      // if (
      //   block.name.includes("air") &&
      //   blockBelow &&
      //   !blockBelow.name.includes("air")
      // ) {
      //   state.interactiveBlock = block;
      return "SUCCESS";
      //}
    }
    //this script goes trhough every available space in an area around it and return an available position for the table
    //digging straight down causes problems
    //improvements: expanding the search area after a fail, adding a functionality to mine a block thats in the way

    for (let dy = 0; dy <= this.placementDistance; dy++) {
      for (
        let dx = -this.placementDistance;
        dx <= this.placementDistance;
        dx++
      ) {
        for (
          let dz = -this.placementDistance;
          dz <= this.placementDistance;
          dz++
        ) {
          if (dx === 0 && dz === 0) continue;

          const standPos = botPos.offset(dx, dy, dz);
          let blockAbove = bot.blockAt(standPos);
          if (blockAbove && blockAbove.name === "air") {
            const posUnder = botPos.offset(dx, -1, dz);
            let blockBelow = bot.blockAt(posUnder);
            if (blockBelow && blockBelow.name !== "air") {
              bot.chat(`Will place block at ${blockAbove.position}`);
              state[this.stateKey] = blockAbove;
              return "SUCCESS";
            }
          }
        }
      }
    }

    bot.chat(`found no places`);
    state[this.stateKey] = null;
    return "FAILURE";
    //return null;
  }
}

module.exports = FindInteractiveBlockPlacementNode;
