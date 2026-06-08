const { Sequence } = require('../behaviorTree');
const CheckNetherDimensionNode = require('../nodes/checkNetherDimensionNode');
const CheckEquipmentNode = require('../nodes/checkEquipmentNode');
const EquipArmorNode = require('../nodes/equipArmorNode');
const FindBlockNode = require('../nodes/findBlockNode');
const MoveToBlockNode = require('../nodes/moveToBlockNode');
const EnterPortalNode = require('../nodes/enterPortalNode');
const LocateFortressNode = require('../nodes/locateFortressNode');
const MoveToFortressNode = require('../nodes/moveToFortressNode');
const MoveToBlazeSpawnerNode = require('../nodes/moveToBlazeSpawnerNode');
const IdleNode = require('../nodes/idleNode');

// Blaze hunting nodes
const FindMobNode = require('../nodes/findMobNode');
const MoveToMobNode = require('../nodes/moveToMobNode');
const AttackNode = require('../nodes/attackNode');
const RangedAttackNode = require('../nodes/rangedAttackNode');
const PickUpItemNode = require('../nodes/pickUpItemNode');

// Other Blaze hunting utilities
const { findMobs } = require('../../behaviors/findEnteties');
const { getClosestEntity, isTargetFloating } = require('../../utils/target');

const { moveToPiglinScore, enterNetherScore, findFortressScore, findBlazeSpawnerScore, lootBlazeRodsScore, huntBlazeScore, getGoldNetherScore, craftGoldNetherScore, barteringScore, } = require('../scores/netherScores');

// Gold collection and crafting nodes
const BreakBlockNode = require("../nodes/breakBlockNode");
const FindInteractiveBlockPlacementNode = require('../nodes/findInteractiveBlockPlaceNode');
const PlaceBlockNode = require("../nodes/placeBlockNode");
const CraftItemUsingTableNode = require("../nodes/craftItemUsingTableNode");
const { ITEMS } = require('../../config');
const DropItemNode = require('../nodes/dropItemNode');
const ToggleBarteringNode = require('../nodes/startBarteringNode');


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

  const goldSeq = new Sequence([
    new FindBlockNode(
      "GOLD",
      "blockTarget",
      config.BLOCKS.GOLD.maxBlockDistance,
    ),

    new MoveToBlockNode(
      "blockTarget",
      config.BT.MOVE_NEAR_DISTANCE,
      config.BT.BREAK_RANGE,
    ),

    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "PICKAXES"),

    new PickUpItemNode(config.ITEMS.GOLD_NUGGETS.names),
  ]);

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

  const tablePickUpSeq = new PickUpItemNode(config.ITEMS.CRAFTING_TABLE.names);

  const tablePlacingSeq = new Sequence([
    //find placement
    new FindInteractiveBlockPlacementNode(),
    //place block
    new PlaceBlockNode("crafting_table"),
  ]);

  const craftingSeq = new Sequence([
    //find crafting table
    new FindBlockNode("crafting_table"),
    //craft item
    new CraftItemUsingTableNode("gold_ingot"),
  ]);

  const tableBreakingSeq = new Sequence([
    //find crafting table
    new FindBlockNode("crafting_table"),
    //move to crafting table
    new MoveToBlockNode(
      "blockTarget",
      config.BT.MOVE_NEAR_DISTANCE,
      config.BT.BREAK_RANGE,
    ),
    //break crafting table
    new BreakBlockNode("blockTarget", config.BT.BREAK_RANGE, "AXES"),
    //pick up crafting table
    new PickUpItemNode(config.ITEMS.CRAFTING_TABLE.names),
  ])

    //bot isnt picking up the crafting table after breaking it

  const moveToPiglinSeq = new Sequence([ //ako se ne bartera trenutno
    new FindMobNode("PIGLINS","currentTarget",true),
    // new MoveToMobNode("currentTarget",2,4), 
    new MoveToMobNode(),  
    new ToggleBarteringNode(), 
    new DropItemNode("gold_ingot",1),
  ]);

  const barteringSeq = new Sequence([ //ako ima manje od 12 ender pearls
    new PickUpItemNode(config.PIGLIN_BARTER.names),

    new ToggleBarteringNode(),
  ]);

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

  const lootRodSeq = new Sequence([
    // Loot dropped blaze rods (if any) before they despawn or burn.
    new PickUpItemNode(config.BLAZE_RODS.names),
  ]);

  const rangedBlazeHuntSeq = new Sequence([
    new FindMobNode('BLAZES'),
    new RangedAttackNode(),
  ]);

  const meleeBlazeHuntSeq = new Sequence([
    // Hunt blazes for rods if we don't have enough and we are in hunting mode.
    new FindMobNode('BLAZES'),
    new AttackNode(),
  ]);

  return {
    candidates: [
      { name: 'EnterNether', node: enterSeq, scoreFn: enterNetherScore },
      { name: 'PickUpTable', node: tablePickUpSeq, scoreFn: tablePickUpScore },
      { name: 'PlaceTable', node: tablePlacingSeq, scoreFn: placeTableScore },
      { name: 'UseTable', node: craftingSeq, scoreFn: useTableScore },
      { name: 'BreakTable', node: tableBreakingSeq, scoreFn: breakTableScore },
      { name: 'CollectNetherGold', node: goldSeq, scoreFn: getGoldNetherScore },
      { name: 'MoveToPiglin', node: moveToPiglinSeq, scoreFn: moveToPiglinScore },
      { name: 'BarterWithPiglin', node: barteringSeq, scoreFn: barteringScore },
      { name: 'FindFortress', node: fortressSeq, scoreFn: findFortressScore },
      { name: 'LootBlazeRod', node: lootRodSeq, scoreFn: lootBlazeRodsScore },

      {
        name: 'RangedHuntBlazes',
        node: rangedBlazeHuntSeq,
        scoreFn: (bot, state, config) => {

          const score = huntBlazeScore(bot, state, config);

          if (score <= 0) return 0;

          const blazes = findMobs(
            bot,
            config.BLAZES,
            state.sensors?.entities
          );

          if (!blazes.length) return 0;

          const target = getClosestEntity(bot, blazes);

          if (!target) return 0;

          if (isTargetFloating(bot, target)) {
            return score + 5;
          }

          return 0;
        }
      },

      {
        name: 'MeleeHuntBlazes',
        node: meleeBlazeHuntSeq,
        scoreFn: (bot, state, config) => {

          const score = huntBlazeScore(bot, state, config);

          if (score <= 0) return 0;

          const blazes = findMobs(
            bot,
            config.BLAZES,
            state.sensors?.entities
          );

          if (!blazes.length) return 0;

          const target = getClosestEntity(bot, blazes);

          if (!target) return 0;

          if (!isTargetFloating(bot, target)) {
            return score;
          }

          return 0;
        }
      },

      { name: 'FindBlazeSpawner', node: blazeSpawnerSeq, scoreFn: findBlazeSpawnerScore },
      { name: 'Idle', node: new IdleNode(), scoreFn: () => 1 },
    ],
    fallbackNode: new IdleNode(),
  };
}

module.exports = { createNetherProfile };
