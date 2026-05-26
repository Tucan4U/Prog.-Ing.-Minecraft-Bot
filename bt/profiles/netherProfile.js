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
const { enterNetherScore, findFortressScore, findBlazeSpawnerScore } = require('../scores/netherScores');

// For blaze spawner search we reuse the generic FindBlock and MoveToBlock nodes.

function createNetherProfile(config) {

  const enterSeq = new Sequence([
    // Enter Nether sequence: check if already in Nether, 
    // if not check for required equipment, then find nearest portal and enter it.
    new CheckNetherDimensionNode(),
    new CheckEquipmentNode(),
    new EquipArmorNode(),
    new FindBlockNode('NETHER_PORTAL', 'blockTarget', config.BLOCKS.NETHER_PORTAL.maxBlockDistance),
    new MoveToBlockNode('blockTarget', 0, 0),
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

  const blazeSpawnerSeq = new Sequence([
    // Blaze spawner search sequence: equip gear, then find blaze spawner by looking for spawner blocks, 
    // then move to it.
    new CheckEquipmentNode(),
    new EquipArmorNode(),
    new FindBlockNode('BLAZE_SPAWNER', 'blazeSpawnerBlock', config.BLOCKS.BLAZE_SPAWNER.maxBlockDistance),
    new MoveToBlazeSpawnerNode(),
  ]);

  return {
    // Three main candidates in order of execution priority (decided by scores):
    // 1. EnterNether: finds and enters a Nether portal (score 200 when requested)
    // 2. FindFortress: locates and travels to a fortress (score 150 when in Nether + requested)
    // 3. FindBlazeSpawner: looks for blaze spawners (score 100 when in Nether + requested + low blaze rods)
    candidates: [
      { name: 'EnterNether', node: enterSeq, scoreFn: enterNetherScore },
      { name: 'FindFortress', node: fortressSeq, scoreFn: findFortressScore },
      { name: 'FindBlazeSpawner', node: blazeSpawnerSeq, scoreFn: findBlazeSpawnerScore },
      { name: 'Idle', node: new IdleNode(), scoreFn: () => 1 },
    ],
    fallbackNode: new IdleNode(),
  };
}

module.exports = { createNetherProfile };
