const mineflayer = require("mineflayer");
const {placeCraftingTable, craftGoldenIngots, pickUpTable} = require("./crafting_functions.js")

const {
  pathfinder,
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");
const { countItems } = require("./general_functions.js");
const { piglinBarter } = require("./piglin_functions.js");

function loadGold(bot) {
  let gold = [];
  const minecraftData = require("minecraft-data")(bot.version);
  minecraftData.blocksArray.forEach((block) => {
    if (block.displayName.endsWith("Gold Ore")) {
      gold.push(block.id);
    }
  });
  return gold;
}

async function collectGoldNether(bot, amountToCollect) {
  let distance = 10;
  const mcData = require("minecraft-data")(bot.version);
  const goldId = mcData.blocksByName.nether_gold_ore.id;

  while (countItems(bot, "gold_ingot") < amountToCollect) {
    bot.chat(`Looking for gold in radius ${distance}`);  

    const gold = bot.findBlock({
      matching: goldId,
      maxDistance: distance
    });

    // bot.chat(`Tried finding gold`);  

    if (gold && gold.position.y > 37) {
      bot.chat(`I found some gold at ${gold.position}`); 
      try {
        // bot.chat(`Prije await`);  
        await bot.collectBlock.collect(gold, {
           ignoreNoPath: true
        });
        distance = 10;
        // bot.chat(`Pole await`);  
        const nuggets = countItems(bot, "gold_nugget");
        bot.chat(`I have ${nuggets} gold nuggets.`);
        if(nuggets >= 9){
          await placeCraftingTable(bot);
          await craftGoldenIngots(bot);
          await pickUpTable(bot);
        }
        const ingots = countItems(bot, "gold_ingot");
        bot.chat(`I have ${ingots} gold ingots.`);
      } catch (err) {
        console.log("Error collecting gold ore:", err);
        bot.chat("Error collecting gold ore:");
        break;
      } finally{
        continue;
      }
    }else{
        bot.chat("No more nether gold ore nearby.");
        distance+=10;
        if (distance <= 100){
            bot.chat(`Expanding search radius to ${distance}`);  
        }else{
            break
        }
    }
  }

  piglinBarter(bot, 500);
}

module.exports = { collectGoldNether };

//sometimes mines into lava
//stops moving and does nothing
//if it cant place a crafting table it breaks