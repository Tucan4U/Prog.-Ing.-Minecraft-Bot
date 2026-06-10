// Hostile combat profile definira utility ponašanje za borbu protiv hostile mobova.
const { Sequence } = require('../behaviorTree');

const FindMobNode = require('../nodes/findMobNode');
const MoveToMobNode = require('../nodes/moveToMobNode');
const AttackNode = require('../nodes/attackNode');
const IdleNode = require('../nodes/idleNode');

const { huntHostileScore } = require('../scores/combatScores');

function createHostileCombatProfile(config) {
  const huntHostilesNode = new Sequence([
    new FindMobNode('HOSTILES'),
    new AttackNode(), // The PvP plugin handles the movement natively
  ]);

  return {
    candidates: [
      {
        name: 'HuntHostiles',
        node: huntHostilesNode,
        scoreFn: huntHostileScore,
      },
      {
        name: 'Idle',
        node: new IdleNode(),
        scoreFn: () => 1,
      },
    ],
    fallbackNode: new IdleNode(),
  };
}

module.exports = { createHostileCombatProfile };