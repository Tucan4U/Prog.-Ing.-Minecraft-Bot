const { Sequence } = require('../behaviorTree');
const CheckNetherDimensionNode = require('../nodes/checkNetherDimensionNode');
const CheckEquipmentNode = require('../nodes/checkEquipmentNode');
const EquipArmorNode = require('../nodes/equipArmorNode');
const FindBlockNode = require('../nodes/findBlockNode');
const MoveToBlockNode = require('../nodes/moveToBlockNode');
const EnterPortalNode = require('../nodes/enterPortalNode');
const LocateFortressNode = require('../nodes/locateFortressNode');
const MoveToFortressNode = require('../nodes/moveToFortressNode');
const IdleNode = require('../nodes/idleNode');
const { enterNetherScore, findFortressScore } = require('../scores/netherScores');

function createNetherProfile(config) {
  // Nether profile sequence: check dimension and equipment, find a portal, move to it, and enter.
  const enterSeq = new Sequence([
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

  return {
    // Two main candidates in order of execution priority (decided by scores):
    // 1. EnterNether: finds and enters a Nether portal (score 200 when requested)
    // 2. FindFortress: locates and travels to a fortress (score 150 when in Nether + requested)
    // Once in Nether, EnterNether score drops to 0, so FindFortress becomes active.
    candidates: [
      { name: 'EnterNether', node: enterSeq, scoreFn: enterNetherScore },
      { name: 'FindFortress', node: fortressSeq, scoreFn: findFortressScore },
      { name: 'Idle', node: new IdleNode(), scoreFn: () => 1 },
    ],
    fallbackNode: new IdleNode(),
  };
}

module.exports = { createNetherProfile };
