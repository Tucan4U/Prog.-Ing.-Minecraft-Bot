const { Sequence } = require("../behaviorTree");
const CheckNetherDimensionNode = require("../nodes/checkNetherDimensionNode");
const CheckEquipmentNode = require("../nodes/checkEquipmentNode");
const EquipArmorNode = require("../nodes/equipArmorNode");
const FindBlockNode = require("../nodes/findBlockNode");
const MoveToBlockNode = require("../nodes/moveToBlockNode");
const EnterPortalNode = require("../nodes/enterPortalNode");
const LocateFortressNode = require("../nodes/locateFortressNode");
const MoveToFortressNode = require("../nodes/moveToFortressNode");
const MoveToBlazeSpawnerNode = require("../nodes/moveToBlazeSpawnerNode");
const IdleNode = require("../nodes/idleNode");
const BreakBlockNode = require("../nodes/breakBlockNode");
const PickUpItemNode = require("../nodes/pickUpItemNode");
const FindInteractiveBlockPlacementNode = require("../nodes/findInteractiveBlockPlaceNode");
const PlaceBlockNode = require("../nodes/placeBlockNode");
const CraftItemUsingTableNode = require("../nodes/craftItemUsingTableNode");
const {
  enterNetherScore,
  findFortressScore,
  getGoldNetherScore,
  craftGoldNetherScore,
  findBlazeSpawnerScore,
} = require("../scores/netherScores");
const { ITEMS } = require("../../config");

function createNetherProfile(config) {
  const enterSeq = new Sequence([
    // Enter Nether sequence: check if already in Nether,
    // if not check for required equipment, then find nearest portal and enter it.
    new CheckNetherDimensionNode(),
    new CheckEquipmentNode(),
    new EquipArmorNode(),
    new FindBlockNode(
      "NETHER_PORTAL",
      "blockTarget",
      config.BLOCKS.NETHER_PORTAL.maxBlockDistance,
    ),
    new MoveToBlockNode("blockTarget", 0, 0),
    new EnterPortalNode(200),
  ]);

  const fortressSeq = new Sequence([
    // Fortress search sequence: equip gear, then locate fortress by finding nether brick clusters,
    // then travel to the fortress surface using stepped long-range pathfinding.
    new CheckEquipmentNode(),
    new EquipArmorNode(), // Maybe remove if we assume the bot keeps its gear after entering the Nether, but it can be a safeguard.
    new LocateFortressNode(20000),
    new MoveToFortressNode(400, 5),
  ]);

  // const goldSeq = new Sequence([
  //   new FindBlockNode(
  //     "GOLD",
  //     "blockTarget",
  //     config.BLOCKS.GOLD.maxBlockDistance,
  //   ),

  //   new MoveToBlockNode(
  //     "blockTarget",
  //     config.BT.MOVE_NEAR_DISTANCE,
  //     config.BT.BREAK_RANGE,
  //   ),

  //   new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),

  //   new PickUpItemNode(config.ITEMS.GOLD.names),
  // ]);

  const goldCraftingSeq = new Sequence([
    //find placement
    new FindInteractiveBlockPlacementNode(),
    //place block
    new PlaceBlockNode("crafting_table"),
    //craft item
    new CraftItemUsingTableNode("gold_ingot"),
    //find crafting table
    new FindBlockNode("crafting_table"),
    //break crafting table
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "AXES"),
    //pick up crafting table
    new PickUpItemNode(config.ITEMS.CRAFTING_TABLE.names),
  ]);

  //bot isnt picking up the crafting table after breaking it
  const blazeSpawnerSeq = new Sequence([
    // Blaze spawner search sequence: equip gear, then find blaze spawner by looking for spawner blocks,
    // then move to it.
    // For blaze spawner search we reuse the generic FindBlock and MoveToBlock nodes.
    new CheckEquipmentNode(),
    new EquipArmorNode(),
    new FindBlockNode(
      "BLAZE_SPAWNER",
      "blazeSpawnerBlock",
      config.BLOCKS.BLAZE_SPAWNER.maxBlockDistance,
    ),
    new MoveToBlazeSpawnerNode(),
  ]);

  return {
    // Three main candidates in order of execution priority (decided by scores):
    // 1. EnterNether: finds and enters a Nether portal (score 200 when requested)
    // 2. CollectGoldNether: finds and collects gold in the Nether
    // 3. FindFortress: locates and travels to a fortress (score 150 when in Nether + requested)
    // Once in Nether, EnterNether score drops to 0, so FindFortress becomes active.
    // 2. FindFortress: locates and travels to a fortress (score 150 when in Nether + requested)
    // 3. FindBlazeSpawner: looks for blaze spawners (score 100 when in Nether + requested + low blaze rods)
    candidates: [
      { name: "EnterNether", node: enterSeq, scoreFn: enterNetherScore },
      //{ name: "CollectNetherGold", node: goldSeq, scoreFn: getGoldNetherScore },
      {
        name: "CraftNetherGold",
        node: goldCraftingSeq,
        scoreFn: craftGoldNetherScore,
      },
      { name: "FindFortress", node: fortressSeq, scoreFn: findFortressScore },
      {
        name: "FindBlazeSpawner",
        node: blazeSpawnerSeq,
        scoreFn: findBlazeSpawnerScore,
      },
      { name: "Idle", node: new IdleNode(), scoreFn: () => 1 },
    ],
    fallbackNode: new IdleNode(),
  };
}

module.exports = { createNetherProfile };
