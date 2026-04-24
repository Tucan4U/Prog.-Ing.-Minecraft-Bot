const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

const StateMachine = require('./fsm');

const config = require('./config');
const state = require('./state');

const { findFood } = require('./behaviors/loot');
const { findAnimals } = require('./behaviors/findEnteties');
const { attackTarget } = require('./behaviors/combat');

const { equipBestWeapon } = require('./utils/inventory');
const { getClosestEntity } = require('./utils/target');

const { Selector, Sequence } = require('./bt/behaviorTree');

const LootNode = require('./bt/nodes/lootNode');
const HuntNode = require('./bt/nodes/huntNode');
const IdleNode = require('./bt/nodes/idleNode');
const FindAnimalNode = require('./bt/nodes/findAnimalNode');
const MoveToAnimalNode = require('./bt/nodes/moveToAnimalNode');
const AttackNode = require('./bt/nodes/attackNode');
const FindLogNode = require('./bt/nodes/findLogNode');
const MoveToLogNode = require('./bt/nodes/moveToLogNode');
const BreakLogNode = require('./bt/nodes/breakLogNode');

const bot = mineflayer.createBot({
  host: "localhost",
  port: 25565,
  username: "IndexBot",
});

bot.loadPlugin(pathfinder);
bot.loadPlugin(require("mineflayer-collectblock").plugin);

// lov na zivotinje razbijen u manje nodeove radi lakšeg razvoja, održavanja i debugganja 
const huntSequence = new Sequence([
    new FindAnimalNode(),
    new MoveToAnimalNode(),
    new AttackNode(),
]);
// sekvencu za sjeckanje logova: pronađi log → dođi do njega → slomi ga
const breakLogsSequence = new Sequence([
    new FindLogNode(),
    new MoveToLogNode(),
    new BreakLogNode(),
]);
// glavno stablo ponašanja, prioritet gre od gore prema dole
const tree = new Selector([
  new LootNode(),
  huntSequence,
  breakLogsSequence,
  //new HuntNode(),
  new IdleNode()
]);


bot.once('spawn', () => {
  const mcData = require('minecraft-data')(bot.version);
  bot.pathfinder.setMovements(new Movements(bot, mcData));
  
  console.log('Bot spawned');
  
  //fsm.setState('SEARCHING');
  
  startLoop();
});

async function startLoop() {
  while (true) {
    try {
      await loop();
    } catch (err) {
      console.log(err);
    }

    await new Promise(r => setTimeout(r, 500));
  }
}
// glavni loop koji ticka behavior tree(BT)
async function loop() {
  await tree.tick(bot, state, config);
  /* const next = decideNextState();

  if (next !== fsm.getState() && next !== null) {
    fsm.setState(next);
  }
  switch (fsm.getState()) {

    case 'IDLE':
      return idleState();

    case 'SEARCHING':
      return searchingState();

    case 'HUNTING':
      return huntingState();

    case 'COMBAT':
      return combatState();

    case 'LOOTING':
      return lootingState();
  } */
}

/* function decideNextState() {

  // PRIORITETI
  const food = findFood(bot, config.FOOD);
  if (food) {
    state.lootTarget = food;
    return 'LOOTING';
  }
  return null;
}

function searchingState() {
  console.log("Searching...");

  const food = findFood(bot, config.FOOD);

  if (food) {
    state.lootTarget = food;
    fsm.setState('LOOTING');
    return;
  }

  const animals = findAnimals(bot, config.ANIMALS);

  if (animals.length > 0) {
    state.currentTarget = getClosestEntity(bot, animals);
    fsm.setState('HUNTING');
    return;
  }

  fsm.setState('IDLE');
}

function idleState() {
  console.log("Idle...");

  // nakon kratkog vremena opet traži
  fsm.setState('SEARCHING');
}

function huntingState() {
  const target = state.currentTarget;

  if (!target) {
    fsm.setState('SEARCHING');
    return;
  }

  const dist = bot.entity.position.distanceTo(target.position);

  bot.pathfinder.setGoal(new goals.GoalNear(
    target.position.x,
    target.position.y,
    target.position.z,
    2
  ));

  if (dist < 3) {
    fsm.setState('COMBAT');
  }
}

async function combatState() {
  const target = state.currentTarget;
  console.log(`Engaging ${target.name} @ ${Math.round(bot.entity.position.distanceTo(target.position))} blocks`);
  if (!target || !bot.entities[target.id]) {
    console.log('Target lost or dead');
    state.currentTarget = null;
    fsm.setState('LOOTING');
    return;
  }

  const dist = bot.entity.position.distanceTo(target.position);
  if(dist > 4) {
    console.log('Target out of range, chasing...');
    fsm.setState('HUNTING');
    return;
  }

  await equipBestWeapon(bot, config.WEAPONS, state);
  bot.lookAt(target.position);
  attackTarget(bot, target);
}

function lootingState() {
  const loot = state.lootTarget;

  if (!loot || !loot.position) {
    state.lootTarget = null;
    fsm.setState('SEARCHING');
    return;
  }

  bot.pathfinder.setGoal(new goals.GoalBlock(
    loot.position.x,
    loot.position.y,
    loot.position.z
  ));

  const dist = bot.entity.position.distanceTo(loot.position);

  if (dist < 1.5) {
    state.lootTarget = null;
    fsm.setState('SEARCHING');
  }
} */

// CHAT
bot.on('chat', (username, message) => {
  if (message === 'stop') bot.end();
});

//  ERROR
bot.on('error', err => console.log(' ERROR:', err.message));
bot.on('end', () => console.log('Bot disconnect!'));

console.log('=== BOT 1.21.11 ===');