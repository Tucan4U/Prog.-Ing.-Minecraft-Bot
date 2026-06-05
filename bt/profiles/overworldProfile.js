// Overworld profile definira score funkcije za top-level ponašanja.
const { Sequence, Selector } = require("../behaviorTree");
const conditionNode = require("../decorators/conditionNode");

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
const RemoveItemNode = require("../nodes/removeItemNode");
const GiveItemNode = require("../nodes/giveItemNode");

const {
  pickUpFoodScore,
  cookFoodScore,
  smeltItemsScore,
} = require("../scores/survivalScores");
const { huntAnimalsScore } = require("../scores/combatScores");
const {
  gatherLogsScore,
  gatherStoneScore,
  gatherDirtScore,
  gatherCoalScore,
  gatherIronScore,
} = require("../scores/gatheringScores");
const {
  craftCraftingTableScore,
  pickUpCraftingTableScore,
  craftFurnaceScore,
  craftWoodenPickaxeScore,
  craftStonePickaxeScore,
  craftIronPickaxeScore,
  craftDiamondPickaxeScore,
} = require("../scores/craftingScores");

const { resetScore } = require("../scores/resetScore");

const { hasAnyItem } = require("../../utils/inventory");

function createOverworldProfile(bot, config) {
  const pickUpFoodNode = new PickUpItemNode(config.ITEMS.RAWFOOD.names);
  const pickUpCraftingTableNode = new PickUpItemNode(config.ITEMS.CRAFTING_TABLE.names);

  const huntAnimalsSeq = new Sequence([
    new FindMobNode("ANIMALS"),
    new MoveToMobNode("currentTarget",config.BT.MOVE_NEAR_DISTANCE,config.BT.MOVE_SUCCESS_DISTANCE,config.BT.MOVE_STATUS_THROTTLE_MS),
    new AttackNode(),
  ]);

  const gatherLogsSeq = new Sequence([
    new FindBlockNode("LOGS", "blockTarget", config.BLOCKS.LOGS.maxBlockDistance),
    new MoveToBlockNode("blockTarget", config.BT.MOVE_NEAR_DISTANCE, config.BT.BREAK_RANGE),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "AXES"),
  ]);
  const gatherLogsSelector = new Selector([
    new PickUpItemNode(config.BLOCKS.LOGS.names),
    gatherLogsSeq,
  ]);

  const gatherDirtSeq = new Sequence([
    new FindBlockNode("DIRT", "blockTarget", config.BLOCKS.DIRT.maxBlockDistance),
    new MoveToBlockNode("blockTarget", config.BT.MOVE_NEAR_DISTANCE,config.BT.BREAK_RANGE),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "SHOVELS"),
  ]);
  const gatherDirtSelector = new Selector([
    new PickUpItemNode(config.BLOCKS.DIRT.names),
    gatherDirtSeq,
  ]);

  const cookFoodSeq = new Sequence([
    new PrepareFurnaceMaterialsNode(config.ITEMS.RAWFOOD.names, config.FURNACE.FUEL.names),
    new DigPitNode(3), // improvizirana "furnace setup" sekvenca - iskopaj rupu, baci stvari unutra, pokrij zemljom
    new PlaceBlockNode("furnace"),
    new PlaceCoverBlockNode(),
    new LoadFurnaceNode(),
    new WaitFurnaceNode(2000),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),
    new ResetFurnaceWorkflowNode(),
  ]);

  const smeltItemsSeq = new Sequence([
    new PrepareFurnaceMaterialsNode(config.FURNACE.GOLD_IRON.names, config.FURNACE.FUEL.names),
    new DigPitNode(3), // improvizirana "furnace setup" sekvenca - iskopaj rupu, baci stvari unutra, pokrij zemljom
    new PlaceBlockNode("furnace"),
    new PlaceCoverBlockNode(),
    new LoadFurnaceNode(),
    new WaitFurnaceNode(2000),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),
    new ResetFurnaceWorkflowNode(),
  ]);

  const commandCraftingTableSeq = new Sequence([
    new RemoveItemNode(config.BLOCKS.LOGS.names, 1),
    new GiveItemNode(["crafting_table"], 1),
  ]);

  const commandCraftingTableCond = new conditionNode(
    "NeedsCraftingTable",
    () => !hasAnyItem(bot, ["crafting_table"]),
    commandCraftingTableSeq,
  );

  const commandWoodenPickaxeSeq = new Sequence([
    new RemoveItemNode(config.BLOCKS.LOGS.names, 2),
    new GiveItemNode(["oak_planks"], 3),
    new GiveItemNode(["stick"], 2),
    new GiveItemNode(["wooden_pickaxe"], 1),
  ]);
  const commandWoodenPickaxeCond = new conditionNode(
    "NeedsWoodenPickaxe",
    () => !hasAnyItem(bot, ["wooden_pickaxe"]),
    commandWoodenPickaxeSeq,
  );

  const commandStonePickaxeSeq = new Sequence([
    new RemoveItemNode("cobblestone", 3), //INPUT : 1 LOG & 3 COBBLESTONE
    new RemoveItemNode(config.BLOCKS.LOGS.names, 1),
    new GiveItemNode(["stick"], 6), //OUTPUT : 6 STICKS(1 LOG -> 8 STICKS - 2 STICKS = 6 STICKS) + 1 STONE PICKAXE
    new GiveItemNode(["stone_pickaxe"], 1),
  ]);
  const commandStonePickaxeCond = new conditionNode(
    "NeedsStonePickaxe",
    () => !hasAnyItem(bot, ["stone_pickaxe"]),
    commandStonePickaxeSeq,
  );

  const commandIronPickaxeSeq = new Sequence([
    new RemoveItemNode("iron_ingot", 3), //INPUT : 1 LOG & 3 IRON INGOTS
    new RemoveItemNode(config.BLOCKS.LOGS.names, 1),
    new GiveItemNode(["stick"], 6), //OUTPUT : 6 STICKS(1 LOG -> 8 STICKS - 2 STICKS = 6 STICKS) + 1 IRON PICKAXE
    new GiveItemNode(["iron_pickaxe"], 1),
  ]);
  const commandIronPickaxeCond = new conditionNode(
    "NeedsIronPickaxe",
    () => !hasAnyItem(bot, ["iron_pickaxe"]),
    commandIronPickaxeSeq,
  );

  const commandDiamondPickaxeSeq = new Sequence([
    new RemoveItemNode("diamond", 3), //INPUT : 1 LOG & 3 DIAMOND
    new RemoveItemNode(config.BLOCKS.LOGS.names, 1),
    new GiveItemNode(["stick"], 6), //OUTPUT : 6 STICKS(1 LOG -> 8 STICKS - 2 STICKS = 6 STICKS) + 1 DIAMOND PICKAXE
    new GiveItemNode(["diamond_pickaxe"], 1),
  ]);
  const commandDiamondPickaxeCond = new conditionNode(
    "NeedsDiamondPickaxe",
    () => !hasAnyItem(bot, ["diamond_pickaxe"]),
    commandDiamondPickaxeSeq,
  );

  const commandFurnaceSeq = new Sequence([
    new RemoveItemNode("cobblestone", 8),
    new GiveItemNode(["furnace"], 1),
  ]);
  const commandFurnaceCond = new conditionNode(
    "NeedsFurnace",
    () => !hasAnyItem(bot, ["furnace"]),
    commandFurnaceSeq,
  );

  const gatherStoneSeq = new Sequence([
    new FindBlockNode("STONE","blockTarget",config.BLOCKS.STONE.maxBlockDistance),
    new MoveToBlockNode("blockTarget",config.BT.MOVE_NEAR_DISTANCE,config.BT.BREAK_RANGE),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),
  ]);
  const gatherStoneSelector = new Selector([
    new PickUpItemNode(config.BLOCKS.STONE.names),
    gatherStoneSeq,
  ]);

  const gatherGravelSeq = new Sequence([
    new FindBlockNode("GRAVEL","blockTarget",config.BLOCKS.GRAVEL.maxBlockDistance),
    new MoveToBlockNode("blockTarget",config.BT.MOVE_NEAR_DISTANCE,config.BT.BREAK_RANGE),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),
  ]);
  const gatherGravelSelector = new Selector([
    new PickUpItemNode(config.ITEMS.GRAVEL.names),
    gatherGravelSeq,
  ]);

  const gatherCoalSeq = new Sequence([
    new FindBlockNode("COAL","blockTarget",config.BLOCKS.COAL.maxBlockDistance),
    new MoveToBlockNode("blockTarget",config.BT.MOVE_NEAR_DISTANCE,config.BT.BREAK_RANGE),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),
  ]);
  const gatherCoalSelector = new Selector([
    new PickUpItemNode(config.ITEMS.COAL.names),
    gatherCoalSeq,
  ]);

  const gatherIronSeq = new Sequence([
    new FindBlockNode("IRON","blockTarget",config.BLOCKS.IRON.maxBlockDistance),
    new MoveToBlockNode("blockTarget",config.BT.MOVE_NEAR_DISTANCE, config.BT.BREAK_RANGE),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),
  ]);
  const gatherIronSelector = new Selector([
    new PickUpItemNode(config.ITEMS.IRON.names),
    gatherIronSeq,
  ]);

  const gatherGoldSeq = new Sequence([
    new FindBlockNode("GOLD","blockTarget",config.BLOCKS.GOLD.maxBlockDistance),
    new MoveToBlockNode("blockTarget",config.BT.MOVE_NEAR_DISTANCE,config.BT.BREAK_RANGE),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),
  ]);
  const gatherGoldSelector = new Selector([
    new PickUpItemNode(config.ITEMS.GOLD.names),
    gatherGoldSeq,
  ]);

  const gatherDiamondSeq = new Sequence([
    new FindBlockNode("DIAMOND","blockTarget",config.BLOCKS.DIAMOND.maxBlockDistance),
    new MoveToBlockNode("blockTarget",config.BT.MOVE_NEAR_DISTANCE,config.BT.BREAK_RANGE),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),
  ]);
  const gatherDiamondSelector = new Selector([
    new PickUpItemNode(config.ITEMS.DIAMOND.names),
    gatherDiamondSeq,
  ]);

  const gatherObsidianSeq = new Sequence([
    new FindBlockNode("OBSIDIAN","blockTarget",config.BLOCKS.OBSIDIAN.maxBlockDistance),
    new MoveToBlockNode("blockTarget",config.BT.MOVE_NEAR_DISTANCE,config.BT.BREAK_RANGE),
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),
  ]);
  const gatherObsidianSelector = new Selector([
    new PickUpItemNode(config.ITEMS.OBSIDIAN.names),
    gatherObsidianSeq,
  ]);

  return {
    candidates: [
      {
        name: "GatherDirt",
        node: gatherDirtSelector,
        scoreFn: gatherDirtScore,
      },
      {
        name: "GatherLogs",
        node: gatherLogsSelector,
        scoreFn: gatherLogsScore,
      },
      {
        name: "GatherStone",
        node: gatherStoneSelector,
        scoreFn: gatherStoneScore,
      },
      {
        name: "GatherCoal",
        node: gatherCoalSelector,
        scoreFn: gatherCoalScore,
      },
      {
        name: "GatherIron",
        node: gatherIronSelector,
        scoreFn: gatherIronScore,
      },
      {
        name: "GatherGold",
        node: gatherGoldSelector,
        scoreFn: () => 0,
      },
      {
        name: "GatherDiamond",
        node: gatherDiamondSelector,
        scoreFn: () => 0,
      },
      {
        name: "GatherObsidian",
        node: gatherObsidianSelector,
        scoreFn: () => 0,
      },
      {
        name: "SmeltItems",
        node: smeltItemsSeq,
        scoreFn: smeltItemsScore,
      },
      {
        name: "CookFood",
        node: cookFoodSeq,
        scoreFn: cookFoodScore,
      },
      {
        name: "CraftCraftingTable",
        node: commandCraftingTableCond,
        scoreFn: craftCraftingTableScore,
      },
      {
        name: "CraftFurnace",
        node: commandFurnaceCond,
        scoreFn: craftFurnaceScore,
      },
      {
        name: "CraftWoodenPickaxe",
        node: commandWoodenPickaxeCond,
        scoreFn: craftWoodenPickaxeScore,
      },
      {
        name: "CraftStonePickaxe",
        node: commandStonePickaxeSeq,
        scoreFn: craftStonePickaxeScore,
      },
      {
        name: "CraftIronPickaxe",
        node: commandIronPickaxeSeq,
        scoreFn: craftIronPickaxeScore,
      },
      {
        name: "CraftDiamondPickaxe",
        node: commandDiamondPickaxeSeq,
        scoreFn: craftDiamondPickaxeScore,
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
        name: "PickupCraftingTable",
        node: pickUpCraftingTableNode,
        scoreFn: pickUpCraftingTableScore,
      },
      {
        name: "Idle",
        node: new IdleNode(),
        scoreFn: resetScore,
      },
    ],
    fallbackNode: new IdleNode(),
  };
}

module.exports = { createOverworldProfile };
