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
    const botPos = bot.entity.position;

    //this script goes trhough every available space in an area around it and return an available position for the table
    //digging straight down causes problems
    //improvements: expanding the search area after a fail, adding a functionality to mine a block thats in the way
    if (state[this.stateKey]) return "SUCCESS";
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
