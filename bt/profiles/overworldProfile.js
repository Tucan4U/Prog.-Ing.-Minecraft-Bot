// Overworld profile definira score funkcije za top-level ponašanja.
const { Sequence, Selector } = require("../behaviorTree");

const PickUpItemNode = require("../nodes/pickUpItemNode");
const FindMobNode = require("../nodes/findMobNode");
const MoveToMobNode = require("../nodes/moveToMobNode");
const AttackNode = require("../nodes/attackNode");
const IdleNode = require("../nodes/idleNode");

const FindBlockNode = require("../nodes/findBlockNode");
const MoveToBlockNode = require("../nodes/moveToBlockNode");
const BreakBlockNode = require("../nodes/breakBlockNode");

const PrepareFurnaceMaterialsNode = require("../nodes/prepareFurnaceMaterialsNode");
const DigPitNode = require("../nodes/digPitNode");
const PlaceBlockNode = require("../nodes/placeBlockNode");
const PlaceCoverBlockNode = require("../nodes/placeCoverBlockNode");
const LoadFurnaceNode = require("../nodes/loadFurnaceNode");
const WaitFurnaceNode = require("../nodes/waitFurnaceNode");
const ResetFurnaceWorkflowNode = require("../nodes/resetFurnaceWorkflowNode");
const CraftItemNode = require("../nodes/craftItemNode");
const FindInteractiveBlockPlacementNode = require("../nodes/findInteractiveBlockPlaceNode");
const CraftItemUsingTableNode = require("../nodes/craftItemUsingTableNode");
const ResetStateNode = require("../nodes/resetStateNode");

const { pickUpFoodScore } = require("../scores/survivalScores");
const { huntAnimalsScore } = require("../scores/combatScores");
const { breakLogsScore } = require("../scores/gatheringScores");
const { craftWoodenPickaxeScore } = require("../scores/craftingScores");

function createOverworldProfile(config) {
  const pickUpFoodNode = new PickUpItemNode("RAWFOOD");
  const huntAnimalsSeq = new Sequence([
    new FindMobNode("ANIMALS"),
    new MoveToMobNode(
      "currentTarget",
      config.BT.MOVE_NEAR_DISTANCE,
      config.BT.MOVE_SUCCESS_DISTANCE,
      config.BT.MOVE_STATUS_THROTTLE_MS,
    ),
    new AttackNode(),
  ]);

  const breakLogsSeq = new Sequence([
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

  const smeltItemsSeq = new Sequence([
    new PrepareFurnaceMaterialsNode("RAWFOOD", config.FURNACE.FUEL.names),
    new DigPitNode(3), // improvizirana "furnace setup" sekvenca - iskopaj rupu, baci stvari unutra, pokrij zemljom
    new PlaceBlockNode("furnace"),
    new PlaceCoverBlockNode(),
    new LoadFurnaceNode(),
    new WaitFurnaceNode(2000),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),
    new ResetFurnaceWorkflowNode(),
  ]);

  const smeltItemsNode = new Sequence([
    new PrepareFurnaceMaterialsNode("RAWFOOD", config.FURNACE.FUEL.names),
    new DigPitNode(3), // improvizirana "furnace setup" sekvenca - iskopaj rupu, baci stvari unutra, pokrij zemljom
    new PlaceBlockNode("furnace"),
    new PlaceCoverBlockNode(),
    new LoadFurnaceNode(),
    new WaitFurnaceNode(2000),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),
    new ResetFurnaceWorkflowNode(),
  ]);

  const craftCraftingSeq = new Sequence([
    //Hard-coded sequence for crafting the crafting table
    new CraftItemNode(config.BLOCKS.PLANKS.names, 12),
    new CraftItemNode(["crafting_table"], 1),
    new CraftItemNode(["stick"], 2),
    new FindInteractiveBlockPlacementNode(),

    new PlaceBlockNode("crafting_table"),

    new CraftItemUsingTableNode("wooden_pickaxe"),
    //find crafting table
    new FindBlockNode("CRAFTING_TABLE", "blockTarget", 1),
    //break crafting table
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "AXES"),

    new PickUpItemNode(["crafting_table"]),
    new ResetStateNode(),
  ]);

  return {
    candidates: [
      {
        name: "SmeltItems",
        node: smeltItemsNode,
        scoreFn: () => 1000,
      },
      {
        name: "BreakLogs",
        node: breakLogsSeq,
        scoreFn: breakLogsScore,
      },
      {
        name: "CraftCraftingTable",
        node: craftCraftingSeq,
        scoreFn: craftWoodenPickaxeScore,
      },
      {
        name: "PickUpFood",
        node: pickUpFoodNode,
        scoreFn: pickUpFoodScore,
      },
      {
        name: "HuntAnimals",
        node: huntAnimalsSeq,
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
