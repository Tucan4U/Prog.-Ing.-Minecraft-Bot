// u ovom configu držimo sve statične podatke koji se koriste na više mjesta u kodu,
// npr. lista oružja, hrane, životinja itd.

module.exports = {
  WEAPONS: [
    "diamond_sword",
    "diamond_axe",
    "iron_sword",
    "iron_axe",
    "golden_sword",
    "golden_axe",
    "stone_sword",
    "stone_axe",
    "wooden_sword",
    "wooden_axe",
    "diamond_pickaxe",
    "iron_pickaxe",
    "stone_pickaxe",
    "wooden_pickaxe",
  ],

  AXES: ["wooden_axe", "stone_axe", "iron_axe", "diamond_axe", "golden_axe"],

  PICKAXES: [
    "wooden_pickaxe",
    "stone_pickaxe",
    "iron_pickaxe",
    "diamond_pickaxe",
    "golden_pickaxe",
  ],

  FOOD: [
    "beef",
    "porkchop",
    "chicken",
    "mutton",
    "cooked_beef",
    "cooked_porkchop",
  ],
  //Parametri koji utječu na SUCCESS ili FAILURE unutar BT-a, zbog toga i ime "BT"
  BT: {
    MOVE_NEAR_DISTANCE: 4,
    MOVE_SUCCESS_DISTANCE: 5,
    ATTACK_RANGE: 4,
    MOVE_STATUS_THROTTLE_MS: 3000,
    BREAK_RANGE: 5,
  },
  SENSORS: {
    WORLD_UPDATE_MS: 500,
  },
  PROFILES: {
    OVERWORLD: "OVERWORLD",
    HOSTILE_COMBAT: "HOSTILE_COMBAT",
    NETHER: "NETHER",
  },
  NETHER_MODES: {
    AUTONOMOUS: "AUTONOMOUS",
    MANUAL: "MANUAL",
  },
  BLOCKS: {
    LOGS: {
      names: [
        "oak_log",
        "birch_log",
        "spruce_log",
        "jungle_log",
        "acacia_log",
        "dark_oak_log",
      ],
      maxBlockDistance: 16,
    },
    NETHER_PORTAL: {
      names: ["nether_portal"],
      maxBlockDistance: 64,
    },
    BLAZE_SPAWNER: {
      names: ["spawner", "mob_spawner"],
      maxBlockDistance: 64,
    },
    PLANKS: {
      names: [
        "acacia_planks",
        "oak_planks",
        "spruce_planks",
        "birch_planks",
        "jungle_planks",
        "cherry_planks",
        "dark_oak_planks",
        "mangrove_planks",
        "warped_planks",
      ],
    },
    GOLD: {
      names: ["nether_gold_ore", "gold_ore"],
      maxBlockDistance: 64,
    },
  },
  ITEMS: {
    GOLD: {
      names: ["gold_nugget"],
    },
    CRAFTING_TABLE: {
      names: ["crafting_table"],
    },
  },
  // MOBOVI
  // Tu se nalaze liste mobova koje se koriste kao argumenti u FindMobNode-u
  // Svaki entry ima tip(npr. animal, hostile, mob) i listu imena mobova.
  // za dodati nove mobove potrebno je pogledat mc_data: https://github.com/PrismarineJS/minecraft-data/blob/master/data/pc/1.21.11/entities.json
  // u budućnosti ako lista treba sadržavat mobove različiith tipova trebat će samo promijenit findEntities funkciju da trazi samo po imenu.
  ANIMALS: {
    type: "animal",
    names: ["pig", "cow", "sheep", "chicken"],
  },

  HOSTILES: {
    type: "hostile",
    names: ["zombie", "skeleton", "spider", "creeper"],
  },
  SLIMES: {
    type: "mob",
    names: ["slime"],
  },
};
