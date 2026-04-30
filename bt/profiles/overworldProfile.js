// Overworld profile definira score funkcije za top-level ponašanja.
const { Sequence } = require('../behaviorTree');

const PickUpItemNode = require('../nodes/pickUpItemNode');
const FindMobNode = require('../nodes/findMobNode');
const MoveToMobNode = require('../nodes/moveToMobNode');
const AttackNode = require('../nodes/attackNode');
const IdleNode = require('../nodes/idleNode');

const { pickUpFoodScore } = require('../scores/survivalScores');
const { huntAnimalsScore } = require('../scores/combatScores');

function createOverworldProfile(config) {
  const pickUpFoodNode = new PickUpItemNode('FOOD');
  const huntAnimalsNode = new Sequence([
    new FindMobNode('ANIMALS'),
    new MoveToMobNode(
      'currentTarget',
      config.BT.MOVE_NEAR_DISTANCE,
      config.BT.MOVE_SUCCESS_DISTANCE,
      config.BT.MOVE_STATUS_THROTTLE_MS
    ),
    new AttackNode(),
  ]);

  return {
    candidates: [
      {
        name: 'PickUpFood',
        node: pickUpFoodNode,
        scoreFn: pickUpFoodScore,
      },
      {
        name: 'HuntAnimals',
        node: huntAnimalsNode,
        scoreFn: huntAnimalsScore,
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

module.exports = { createOverworldProfile };