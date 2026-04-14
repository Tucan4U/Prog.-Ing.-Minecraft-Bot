const mineflayer = require("mineflayer");

const {
  pathfinder,
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");

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

async function collectGoldNether(bot) {
  let distance = 10;
  const mcData = require("minecraft-data")(bot.version);
  const goldId = mcData.blocksByName.nether_gold_ore.id;

//   const customMoves = new Movements(bot)
//   // To make changes to the behaviour, customize the properties of the instance
//   customMoves.scafoldingBlocks.push(bot.registry.itemsByName.netherrack.id)
//   // Thing to note scaffoldingBlocks are an array while other namespaces are usually sets
//   customMoves.blocksToAvoid.add(bot.registry.blocksByName.magma_block.id)

//   // To initialize the new movements use the .setMovements method.
//   bot.pathfinder.setMovements(customMoves)

  while (true) {
    bot.chat(`Looking for gold in radius ${distance}`);  

    const gold = bot.findBlock({
      matching: goldId,
      maxDistance: distance
    });

    bot.chat(`Tried finding gold`);  

    if (gold && gold.position.y > 37) {
      bot.chat(`I found some gold at ${gold.position}`); 
      try {
        bot.chat(`Prije await`);  
        await bot.collectBlock.collect(gold);
        distance = 10;
        bot.chat(`Pole await`);  
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
}

module.exports = { loadGold, collectGoldNether };