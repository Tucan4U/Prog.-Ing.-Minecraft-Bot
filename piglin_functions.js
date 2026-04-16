const { GoalNear } = require("mineflayer-pathfinder").goals;
const { GoalFollow } = require("mineflayer-pathfinder").goals;
const { countItems } = require("./general_functions.js");

function findPiglins(bot, maxDistance = 50) {
  //function that returns all the piglins closer then maxDistance
  const entities = Object.values(bot.entities);

  const piglinEntities = entities
    .filter(entity => {
      return entity.name === "piglin";
    })
    .filter(entity => {
      const isBaby = entity.isBaby || (entity.metadata && entity.metadata[15] === 1);
      return !isBaby;
    })
    .filter(entity => {
      const dist = entity.position.distanceTo(bot.entity.position);
      return dist <= maxDistance;
    });

  return piglinEntities;
}

function findClosestPiglin(bot, maxDistance = 50) {
  // Find the single closest normal piglin
  const piglins = findPiglins(bot, maxDistance);
  if (piglins.length === 0) return null;
  return piglins.reduce((closest, piglin) => {
    const d1 = closest.position.distanceTo(bot.entity.position);
    const d2 = piglin.position.distanceTo(bot.entity.position);
    return d2 < d1 ? piglin : closest;
  });
}

async function goToPiglin(bot, maxDistance = 50) { //<== probbably redundant with the behavior tree approach
  //bot goes to the position where it found a piglin
  bot.chat("Looking for piglins nearby...");

  const piglin = findClosestPiglin(bot, maxDistance);

  if (!piglin) {
    bot.chat("No piglin found within range.");
    return;
  }

  bot.chat(`Found piglin at ${piglin.position}`);

  try {
    // Go to a point ~1 block away from the piglin
    await bot.pathfinder.goto(
      new GoalNear(
        piglin.position.x,
        piglin.position.y,
        piglin.position.z,
        1
      )
    );

  } catch (err) {
    bot.chat("Failed to go to piglin: " + err.message);
  }
}

async function followPiglin(bot, maxDistance = 50) {
  //bot follows the nearest piglin until it reaches them
  bot.chat("Searching for a piglin to follow...");

  const piglin = findClosestPiglin(bot, maxDistance);

  if (!piglin) {
    bot.chat("No piglin found nearby.");
    return;
  }

  bot.chat(`Following piglin at ${piglin.position}`);

  try {
    await bot.pathfinder.goto(
      new GoalFollow(piglin, 2)   // 2 = max distance, bot stays roughly 2 blocks away
    );
  } catch (err) {
    bot.chat("Failed to follow piglin: " + err.message);
  }
}

async function dropGoldNearPiglin(bot, maxDistance,count = 1) {
  //if a piglin is nearby the bot drops a gold ingot
  const piglin = findClosestPiglin(bot, maxDistance);
  if (!piglin) {
    bot.chat("No piglin nearby.");
    return;
  }

  const gold = bot.registry.itemsByName.gold_ingot;
  const stack = bot.inventory.items().find(item => item.type === gold.id);

  if (!stack) {
    bot.chat("No gold ingot in inventory.");
    return;
  }

  await bot.toss(gold.id, null, count);

  bot.chat(`Dropped ${count} gold ingot(s) near piglin at ${piglin.position}`);
}

async function waitPiglinBarter(bot, piglin, timeoutMs = 10_000) {
  //function that waits for the piglin to finish evaluating the gold ingot during bartering and returns the entity that it picked up
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const cleanup = () => {
      bot.removeListener("entityGone", onEntityGone);
      bot.removeListener("playerCollect", onPlayerCollect);
      bot.removeListener("entitySpawn", checkForBarterItem);
      clearTimeout(timer);
    };

    const checkForBarterItem = (entity) => {
      //often unreliable
      if (!entity || entity.type !== "object" || entity.name !== "experience_orb") {
        return;
      }

      const distance = entity.position.distanceTo(piglin.position);

      bot.chat(`Picked up ${entity.getDroppedItem().displayName}`);
      if (distance < 10) {
        cleanup();
        resolve(entity);
      }
    };

    const onEntityGone = (entity) => {
      if (entity.id === piglin.id) {
        cleanup();
        reject(new Error("Piglin disappeared before bartering finished"));
      }
    };

    const onPlayerCollect = (collector, collected) => {
      if (collector.username === bot.username) {
        bot.chat(`Collected ${collected.getDroppedItem().displayName}`);
        cleanup();
        resolve(collected);
      }
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Piglin barter timeout"));
    }, timeoutMs);

    bot.on("entitySpawn", checkForBarterItem);
    bot.on("entityGone", onEntityGone);
    bot.on("playerCollect", onPlayerCollect);
  });
}

async function piglinBarter(bot, maxDistance) { //<== probbably redundant with the behavior tree approach but is a good
  ////////////////////////////////////////////////////blueprint for the sequence
  //function that implements the whole bartering loop, from dropping the gold to picking the items up
    const mcData = require("minecraft-data")(bot.version);

    await goToPiglin(bot, maxDistance);

    const gold_cnt = countItems(bot, "gold_ingot");

    for (let index = 0; index < gold_cnt; index++) {
        try{
            await followPiglin(bot, 50);
            await dropGoldNearPiglin(bot, 50, 1);
            await waitPiglinBarter(bot, findClosestPiglin(bot, 50), 12000);

        }catch (err) {
            bot.chat("Failed to barter: " + err.message);
            console.log("Failed to barter:", err);
        }    
        bot.chat(`I got ${countItems(bot, "gold_ingot")} ingots left`);  
        
        if (countItems(bot, "ender_pearl")>=12){
            bot.chat(`I collected enough ender pearls (${countItems(bot, "ender_pearl")})`);
            break;
        }else{
            bot.chat(`I collected ${countItems(bot, "ender_pearl")} ender pearls`);
        }
    }
}

module.exports = { piglinBarter };

//baby filter doesn't always work
//dropping gold shouldn't force piglin to move