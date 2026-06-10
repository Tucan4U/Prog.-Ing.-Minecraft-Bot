const Vec3 = require("vec3");
const { goals } = require("mineflayer-pathfinder");

class NetherPortalBuilder {
  constructor(bot) {
    this.bot = bot;
  }

  async build() {
    const pos = this.bot.entity.position.floored();
    await this.buildPlatform(pos);
    const base = await this.findBuildLocation();

    console.log("Portal base:", base);

    await this.buildFrame(base);


    await this.lightPortal(base);

    console.log("Portal complete.");
  }



  async findBuildLocation() {
  const pos = this.bot.entity.position.floored();
    console.log("Searching for portal build location starting at", pos);
  const BASE_Y = pos.y;

  const X_MIN = 0;
  const X_MAX = 2;

  const Z_MIN = 1;   // ispred bota
  const Z_MAX = 2;  // koliko daleko traži

  for (let dz = Z_MIN; dz <= Z_MAX; dz++) {

    for (let dx = X_MIN; dx <= X_MAX; dx++) {

      const x = pos.x + dx;
      const z = pos.z + dz;
      const y = BASE_Y;
        console.log(`Checking potential portal location at (${x}, ${y}, ${z})`);
      let ok = true;

      // provjeri 4x5 vertikalni prostor + tlo
      for (let xx = -3; xx < 3; xx++) {
        for (let yy = 0; yy < 6; yy++) {

          const block = this.bot.blockAt(
            new Vec3(x + xx, y + yy, z)
          );
            console.log(`Checking block at (${block.position.x}, ${block.position.y}, ${block.position.z}): ${block.name}, ok=${ok}`);
          if (!block || (!block.name.includes("air") && !block.name.includes("grass"))) {
            ok = false;
            break;
          }
        }
        if (!ok) break;
      }

      // dodatna provjera: tlo mora biti čvrsto
      for (let xx = -3; xx < 3; xx++) {
        const ground = this.bot.blockAt(
          new Vec3(x + xx, y - 1, z)
        );
        console.log(`Checking ground at (${ground.position.x}, ${ground.position.y}, ${ground.position.z}): ${ground.name}, ok=${ok}`);
        if (!ground || ground.name.includes("air")) {
          ok = false;
          break;
        }
      }

      if (ok) {
        return new Vec3(x, y, z);
      }
    }
  }

  throw new Error("No flat portal strip found in Z direction");
}

  async equip(name) {
    const item = this.bot.inventory
      .items()
      .find(i => i.name === name);

    if (!item)
      throw new Error(`Missing ${name}`);

    await this.bot.equip(item, "hand");
  }

  async goto(pos) {
    await this.bot.pathfinder.goto(
      new goals.GoalNear(
        pos.x,
        pos.y,
        pos.z,
        3
      )
    );
  }
  async goto2(pos) {
    await this.bot.pathfinder.goto(
      new goals.GoalBlock(
        pos.x,
        pos.y,
        pos.z,
      )
    );
  }

  async placeAt(pos, itemName) {
    const existing = this.bot.blockAt(pos);

    if (
      existing &&
      existing.name === itemName
    ) {
      return;
    }

    await this.equip(itemName);

    const neighbors = [
      pos.offset(1, 0, 0),
      pos.offset(-1, 0, 0),
      pos.offset(0, 1, 0),
      pos.offset(0, -1, 0),
      pos.offset(0, 0, 1),
      pos.offset(0, 0, -1),
    ];

    for (const nPos of neighbors) {
      const neighbor = this.bot.blockAt(nPos);

      if (
        neighbor &&
        !neighbor.name.includes("air")
      ) {
        const dist =
          this.bot.entity.position.distanceTo(
            neighbor.position
          );

        if (dist > 4.5) {
          await this.goto(neighbor.position);
        }

        try {
          await this.bot.placeBlock(
            neighbor,
            pos.minus(nPos)
          );

          await this.bot.waitForTicks(2);

          const placed =
            this.bot.blockAt(pos);

          if (
            placed &&
            placed.name === itemName
          ) {
            return;
          }
        } catch {}
      }
    }

    throw new Error(
      `Failed placing ${itemName} at ${pos}`
    );
  }

  async breakAt(pos) {
    const block = this.bot.blockAt(pos);

    if (
      !block ||
      block.name.includes("air")
    ) {
      return;
    }

    const dist =
      this.bot.entity.position.distanceTo(
        block.position
      );

    if (dist > 10) {
        console.log("Going to block to break it:", block.position);
      await this.goto(block.position);
    }

    await this.bot.dig(block);
  }

  async buildPlatform(pos) {
    
    console.log("Building platform starting at", pos);
    const dirtPlatform1 = [
        //prvi stup
      [0,0],
      [0,1],
      [0,2],
      [0,3],
      [0,4],
        //platforma
      [1,4],
      [2,4],

      [-1,4],
      [-2,4],
      [-3,4],
    ];
    console.log("Placing dirt platform...");
    for (const [x,y] of dirtPlatform1) {
        console.log(`Placing dirt at ${pos.offset(x,y,1)}`);
      await this.placeAt(
        pos.offset(x,y,1),
        "dirt"
      );
    }
    
    const dirtPlatform2 = [
        //platforma
      [1,4],
      [2,4],
      [0,4],
      [-1,4],
      [-2,4],
      [-3,4],
    ];
    console.log("Placing dirt platform...");
    for (const [x,y] of dirtPlatform2) {
        console.log(`Placing dirt at ${pos.offset(x,y,2)}`);
      await this.placeAt(
        pos.offset(x,y,2),
        "dirt"
      );
    }
    console.log("Platform complete.");
    console.log("Moving to platform...");
    await this.goto2(pos.offset(0,5,1));
    while (this.bot.entity.position !== pos.offset(0,5,1)) {
        if (this.bot.entity.position.distanceTo(pos.offset(0,5,1)) < 1) {
            break;
        }
    }
    console.log("On platform.");
}
  async buildFrame(base) {
    //
    // Layout:
    //
    // D D O O  
    // D O     O 
    // D O     O D
    // D O     O D
    // D D O O D D
    //

    const dirt = [
        //prvi stup
      [1,0],

      [2,0],
      [2,1],
      [2,2],
      [2,3],
      [2,4],

      [1,4],
        //drugi stup
      [-2,0],

      [-3,0],
      [-3,1],
      [-3,2],
      [-3,3],
    ];
    console.log("Placing dirt scaffold...");
    for (const [x,y] of dirt) {
        console.log(`Placing dirt at ${base.offset(x,y,0)}`);
      await this.placeAt(
        base.offset(x,y,0),
        "dirt"
      );
    }

    console.log("Placing obsidian frame...");
    const obsidian = [
      [0,0],
      [-1,0],

      [1,1],
      [1,2],
      [1,3],

      [-2,1],
      [-2,2],
      [-2,3],

      [0,4],
      [-1,4]
    ];

    for (const [x,y] of obsidian) {
        console.log(`Placing obsidian at ${base.offset(x,y,0)}`);
      await this.placeAt(
        base.offset(x,y,0),
        "obsidian"
      );
    }
  }

  async removeScaffold(base) {
    const dirt = [
      [0,0],
      [0,1],
      [0,2],
      [0,3],
      [0,4],

      [3,0],
      [3,4]
    ];

    for (const [x,y] of dirt) {
      await this.breakAt(
        base.offset(x,y,0)
      );
    }
  }

  async lightPortal(base) {
    console.log("equipping flint and steel");
    await this.equip("flint_and_steel");
    await this.bot.waitForTicks(10);
    const bottomLeft =
      this.bot.blockAt(
        base.offset(1,-1,0)
      );

    if (!bottomLeft) {
      throw new Error(
        "Portal frame missing"
      );
    }

    const firePos =
      base.offset(-1,1,0);

    //await this.goto(firePos);

    await this.bot.lookAt(
      firePos.offset(0.5,0.5,0.5)
    );
    console.log("igniting portal...");
    const x1 = firePos.x;
    const y1 = firePos.y;
    const z1 = firePos.z;
    
    const x2 = firePos.x + 1;
    const y2 = firePos.y + 2;
    const z2 = firePos.z;

    this.bot.chat(`/fill ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} nether_portal`);

    
  }
}

module.exports = NetherPortalBuilder;