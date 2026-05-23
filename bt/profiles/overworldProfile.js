// Overworld profile definira score funkcije za top-level ponašanja.
const { Sequence } = require("../behaviorTree");

const PickUpItemNode = require("../nodes/pickUpItemNode");
const FindMobNode = require("../nodes/findMobNode");
const MoveToMobNode = require("../nodes/moveToMobNode");
const AttackNode = require("../nodes/attackNode");
const IdleNode = require("../nodes/idleNode");

const FindBlockNode = require("../nodes/findBlockNode");
const MoveToBlockNode = require("../nodes/moveToBlockNode");
const BreakBlockNode = require("../nodes/breakBlockNode");

//const CraftItemNode = require("../nodes/craftItemNode");

const { pickUpFoodScore } = require("../scores/survivalScores");
const { huntAnimalsScore } = require("../scores/combatScores");
const { breakLogsScore } = require("../scores/gatheringScores");
//const { craftCraftingTableScore } = require("../scores/craftingScores");

function createOverworldProfile(config) {
  const pickUpFoodNode = new PickUpItemNode("FOOD");
  const huntAnimalsNode = new Sequence([
    new FindMobNode("ANIMALS"),
    new MoveToMobNode(
      "currentTarget",
      config.BT.MOVE_NEAR_DISTANCE,
      config.BT.MOVE_SUCCESS_DISTANCE,
      config.BT.MOVE_STATUS_THROTTLE_MS,
    ),
    new AttackNode(),
  ]);

  const breakLogsNode = new Sequence([
    new FindBlockNode(
      "LOGS",
      "blockTarget",
      config.BLOCKS.LOGS.maxBlockDistance,
    ),
    new MoveToBlockNode(
      "blockTarget",
      config.BT.MOVE_NEAR_DISTANCE,
      config.BT.BREAK_RANGE,
    ),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "AXES"),
    new PickUpItemNode(config.BLOCKS.LOGS.names),
  ]);

  // const craftCraftingTable = new Sequence([
  //   new CraftItemNode(config.BLOCKS.PLANKS.names),
  //   new CraftItemNode(["crafting_table"]),
  // ]);

  return {
    candidates: [
      {
        name: "BreakLogs",
        node: breakLogsNode,
        scoreFn: breakLogsScore,
      },
      // {
      //   name: "CraftCraftingTable",
      //   node: craftCraftingTable,
      //   scoreFn: craftCraftingTableScore,
      // },
      {
        name: "PickUpFood",
        node: pickUpFoodNode,
        scoreFn: pickUpFoodScore,
      },
      {
        name: "HuntAnimals",
        node: huntAnimalsNode,
        scoreFn: huntAnimalsScore,
      },
      {
        name: "Idle",
        node: new IdleNode(),
        scoreFn: () => 1,
      },
    ],
    fallbackNode: new IdleNode(),
  };
}

module.exports = { createOverworldProfile };
