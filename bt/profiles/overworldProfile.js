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

// Pumpkin part 1
const ShearPumpkinNode = require('../nodes/shearPumpkinNode')
const EquipPumpkinNode = require('../nodes/equipPumpkinNode')

const { pickUpFoodScore } = require("../scores/survivalScores");
const { huntAnimalsScore } = require("../scores/combatScores");
const { breakLogsScore } = require("../scores/gatheringScores");
//const { craftCraftingTableScore } = require("../scores/craftingScores");

// Pumpkin part 2
const { getPumpkinHelmetScore } = require('../scores/oldPumpkinScores')

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

  // Pumpkin part 3
  const getPumpkinHelmetNode = new Sequence([
        new FindBlockNode('PUMPKINS', 'blockTarget', config.BLOCKS.PUMPKINS.maxBlockDistance),
        new MoveToBlockNode('blockTarget', config.BT.MOVE_NEAR_DISTANCE, config.BT.BREAK_RANGE),
        new ShearPumpkinNode('blockTarget'),
        new BreakBlockNode('blockTarget', config.BT.BREAK_RANGE, 'AXES'),
        new PickUpItemNode(['carved_pumpkin']),
        new EquipPumpkinNode(),
    ])

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
      { // Pumpkin part 4
        name: 'GetPumpkinHelmet', node: getPumpkinHelmetNode, scoreFn: getPumpkinHelmetScore
      },
    ],
    fallbackNode: new IdleNode(),
  };
}

module.exports = { createOverworldProfile };