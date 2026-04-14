const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

const bot = mineflayer.createBot({
  host: process.argv[2] || 'localhost',
  port: parseInt(process.argv[3]) || 25565,
  username: process.argv[4] || 'HuntBot',
  version: false
});

bot.loadPlugin(pathfinder);

let currentTarget = null;
let attackInterval = null;
let lootTarget = null;
let lootTimeout = 0;
// Oružja od najjačeg do najslabijeg
const WEAPONS = [
  'netherite_sword',
  'netherite_axe',
  'diamond_sword',
  'diamond_axe',
  'iron_sword',
  'iron_axe',
  'golden_sword',
  'golden_axe',
  'stone_sword',
  'stone_axe',
  'wooden_sword',
  'wooden_axe',
  'netherite_pickaxe',
  'diamond_pickaxe',
  'iron_pickaxe',
  'golden_pickaxe',
  'stone_pickaxe',
  'wooden_pickaxe'
];

const FOOD = [
  'beef', 'porkchop', 'chicken', 'mutton',
  'cooked_beef', 'cooked_porkchop', 'cooked_chicken', 'cooked_mutton'
];

bot.once('spawn', () => {
  const mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);

  console.log('Hunt bot spawned, starting main loop...');

  setInterval(mainLoop, 1000);
});



async function mainLoop() {

  //  ako već skupljamo loot → nastavi
  if (lootTarget && Date.now() < lootTimeout) {
    if (lootTarget.position) {
      bot.pathfinder.setGoal(new goals.GoalBlock(
        lootTarget.position.x,
        lootTarget.position.y,
        lootTarget.position.z
      ));
    }
    return;
  }

  lootTarget = null;

  //  TRAŽI ITEME (HRANU NA PODU)
  const dropped = Object.values(bot.entities).find(e => {
    if (e.name !== 'item') return false; // samo itemi

    const item = e.getDroppedItem?.(); //  NOVO: dobivanje itema iz entiteta mc 1.21
    if (!item) return false; 

    return FOOD.includes(item.name);
  });

  if (dropped) {
    console.log('Food detected');

    lootTarget = dropped;
    lootTimeout = Date.now() + 1000; // sekunda fokus

    bot.pathfinder.setGoal(new goals.GoalBlock(
      dropped.position.x,
      dropped.position.y,
      dropped.position.z
    ));

    return;
  }

  // ŽIVOTINJE
  const animals = Object.values(bot.entities).filter(e =>
    e.type === 'animal' &&
    ['pig', 'cow', 'sheep', 'chicken'].includes(e.name)
  );

  if (animals.length === 0) {
    currentTarget = null;
    bot.pathfinder.setGoal(null);
    stopAttack();
    console.log('No animals found nearby');
    return;
  }
  
  currentTarget = animals.reduce((closest, e) => {  // sprema najbližu životinju u currentTarget varijablu
    const dist = bot.entity.position.distanceTo(e.position);
    if (!closest) return e;

    const closestDist = bot.entity.position.distanceTo(closest.position);
    return dist < closestDist ? e : closest;
  }, null);

  const dist = bot.entity.position.distanceTo(currentTarget.position);
  console.log(` ${currentTarget.name} @ ${Math.round(dist)} blocks`);

  await equipBestWeapon();

  bot.pathfinder.setGoal(new goals.GoalNear(
    currentTarget.position.x,
    currentTarget.position.y,
    currentTarget.position.z,
    2
  ));

  startAttack();
}
// 1. Definiramo listu WEAPONS koja sadrži nazive oružja od najjačeg do najslabijeg.
// 2. Funkcija equipBestWeapon() prolazi kroz tu listu i traži prvi item u inventaru koji se poklapa s nazivom oružja.
// 3. Kada pronađe odgovarajući item, pokušava ga opremiti u ruku (hand).
// 4. Ako uspije, ispisuje poruku o opremanju i izlazi iz funkcije. Ako ne uspije, ispisuje grešku i nastavlja tražiti dalje.
// Na taj način bot uvijek pokušava opremiti najjače dostupno oružje prije nego što krene u napad.
// EQUIP (ASYNC FIX)
async function equipBestWeapon() {
  for (const weapon of WEAPONS) {
    const item = bot.inventory.items().find(i => i.name === weapon);
    if (item) {
      try {
        await bot.equip(item, 'hand'); 
        console.log(`Equipped ${weapon}`);
      } catch (err) {
        console.log('Equip error:', err.message);
      }
      return;
    }
  }
}

// ATTACK
function startAttack() {
  if (attackInterval) return;

  attackInterval = setInterval(() => {
    if (!currentTarget) return;

    const dist = bot.entity.position.distanceTo(currentTarget.position);

    if (dist < 4) {
      bot.lookAt(currentTarget.position);
      bot.attack(currentTarget);
      console.log(`Attacking ${currentTarget.name}`);
    }
  }, 500);
}

function stopAttack() {
  if (attackInterval) {
    clearInterval(attackInterval);
    attackInterval = null;
  }
}

// CHAT
bot.on('chat', (username, message) => {
  if (message === 'stop') bot.end();
});

//  ERROR
bot.on('error', err => console.log(' ERROR:', err.message));
bot.on('end', () => console.log('Bot disconnect!'));

console.log('=== HUNT BOT 1.21.11 ===');