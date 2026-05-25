const { Sequence } = require('../behaviorTree');
const CheckNetherDimensionNode = require('../nodes/checkNetherDimensionNode');
const CheckEquipmentNode = require('../nodes/checkEquipmentNode');
const EquipArmorNode = require('../nodes/equipArmorNode');
const FindBlockNode = require('../nodes/findBlockNode');
const MoveToBlockNode = require('../nodes/moveToBlockNode');
const EnterPortalNode = require('../nodes/enterPortalNode');
const IdleNode = require('../nodes/idleNode');
const { enterNetherScore } = require('../scores/netherScores');

function createNetherProfile(config) {
  // Nether profile sequence: check dimension and equipment, find a portal, move to it, and enter.
  const seq = new Sequence([
    new CheckNetherDimensionNode(),
    new CheckEquipmentNode(),
    new EquipArmorNode(),
    new FindBlockNode('NETHER_PORTAL', 'blockTarget', config.BLOCKS.NETHER_PORTAL.maxBlockDistance),
    new MoveToBlockNode('blockTarget', 0, 0),
    new EnterPortalNode(200),
  ]);

  return {
    candidates: [
      { name: 'EnterNether', node: seq, scoreFn: enterNetherScore },
      { name: 'Idle', node: new IdleNode(), scoreFn: () => 1 },
    ],
    fallbackNode: new IdleNode(),
  };
}

module.exports = { createNetherProfile };
