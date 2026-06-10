const mcData = require("minecraft-data")("1.21.11");
const Recipe = require("prismarine-recipe")("1.21.11").Recipe;
const mineflayer = require("mineflayer");
const { Vec3 } = require("vec3");
// Pronađi sve recepte za wooden pickaxe
const recipes = Recipe.find(946); // 270 = wooden_pickaxe ID

// Ili preko bot-a
//const recipes = bot.recipesFor(270, null, 1, null); // itemId, metadata, count, craftingTable
//console.log(recipes);
//if (recipes[0].inShape) console.log(recipes[0].inShape[0]);
// if (!recipes[0].inShape) console.log(recipes[0].ingredients[0]);
// console.log(recipes[0].delta[0]);
console.log(mcData.itemsByName["dirt"]);



const bot = mineflayer.createBot({
  host: "localhost",
  port: 25565,
  username: "ConsoleBot",
});

bot.on("chat",(username, message) => {
  if (username === bot.username) return;

  if (message === "pos") {
    const playerFilter = (entity) => entity.type === "player";
    const playerEntity = bot.nearestEntity(playerFilter);
    if (playerEntity) {
      const pos = playerEntity.position;
      bot.chat(`Your position is: x=${pos.x}, y=${pos.y}, z=${pos.z}`);
      console.log(bot.blockAt(pos));
    } else {
      bot.chat("No player found nearby.");
    }
  }

  if (message === "waterSelf") {
    try {
      const bucket = bot.inventory.findInventoryItem(mcData.itemsByName["water_bucket"].id);
      if (!bucket) {
        bot.chat("Nemam water bucket.");
        return;
      }

      bot.equip(bucket, "hand");

      const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
      if (!below) {
        bot.chat("Ne mogu naći blok ispod sebe.");
        return;
      }

      // Gledaj u centar gornje plohe bloka ispod sebe
      bot.lookAt(below.position.offset(0.5, 1, 0.5), true);
      bot.waitForTicks(2);

      // Place water on top face
      bot.placeBlock(below, new Vec3(0, 1, 0));
      bot.waitForTicks(2);

      const placedBlock = bot.blockAt(below.position.offset(0, 1, 0));
      if (placedBlock && (placedBlock.name.includes("water") || placedBlock.name.includes("flowing_water"))) {
        bot.chat("Water placed successfully.");
      } else {
        bot.chat("Placement failed — no water detected. Trying fallback...");
        // optional fallback: try activateItem or try alternate neighbor faces/retries
      }
    } catch (err) {
      bot.chat("Greška pri postavljanju vode.");
      console.log(err);
    }
  }
});