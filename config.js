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

  AXES: ["diamond_axe", "iron_axe", "golden_axe", "stone_axe", "wooden_axe"],

  PICKAXES: [
    "diamond_pickaxe",
    "iron_pickaxe",
    "golden_pickaxe",
    "stone_pickaxe",
    "wooden_pickaxe",
  ],

  SHOVELS: [
    "diamond_shovel",
    "iron_shovel",
    "golden_shovel",
    "stone_shovel",
    "wooden_shovel",
  ],

  IRON_ARMOR: ["iron_chestplate", "iron_leggings", "iron_boots"],

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
  CRAFTING_STAGES: {
    STAGES: ["CRAFTING_TABLE", "WOODEN_PICKAXE", "STONE_PICKAXE", "IRON_ARMOR"],
  },
  WOOD_REQUIREMENTS: {
    CRAFTING_TABLE: 1,
    WOODEN_PICKAXE: 2,
    STONE_PICKAXE: 1,
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
    STONE: {
      names: ["cobblestone", "stone"],
      maxBlockDistance: 16,
    },
    CRAFTING_TABLE: {
      names: ["crafting_table"],
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
    FURNACE: {
      names: ["furnace"],
    },
    DIRT: {
      names: ["dirt"],
      maxBlockDistance: 16,
    },
    GRAVEL: {
      names: ["gravel"],
      maxBlockDistance: 64,
    },
    COAL: {
      names: ["coal_ore", "deepslate_coal_ore"],
      maxBlockDistance: 64,
    },
    IRON: {
      names: ["iron_ore", "deepslate_iron_ore"],
      maxBlockDistance: 64,
    },
    GOLD: {
      names: ["nether_gold_ore", "gold_ore", "deepslate_gold_ore"],
      maxBlockDistance: 64,
    },
    DIAMOND: {
      names: ["diamond_ore", "deepslate_diamond_ore"],
      maxBlockDistance: 64,
    },
    OBSIDIAN: {
      names: ["obsidian"],
      maxBlockDistance: 16,
    },
  },

  // Furnace / smelting related config
  FURNACE: {
    FUEL: {
      names: ["coal"],
    },
    GOLD_IRON: { //used in SmeltItemsSeq
      names: ["raw_gold", "raw_iron"],
    },
    FOOD_THRESHOLDS: {
      HUNT_START_AT: 10,
      HUNT_STOP_AT: 32,
    },
    SMELTING_THRESHOLDS: {
      IRON: 30,
      GOLD: 5,
    },
    ITEMS_PER_FUEL_UNIT: 8,
    TIME_PER_ITEM_MS: 10000,
    BURN_MS_PER_FUEL_UNIT: 1600,
  },

 
  ITEMS: {
    CRAFTING_TABLE: {
      names: ["crafting_table"],
    },
    RAWFOOD: { //used in CookFoodSeq
      names: ["beef", "porkchop", "chicken", "mutton"],
    },
    COOKEDFOOD: {
      names: ["cooked_beef", "cooked_porkchop", "cooked_chicken", "cooked_mutton"],
    },
    GRAVEL: {
      names: ["gravel", "flint"],
    },
    COAL: {
      names: ["coal"],
    },
    IRON: {
      names: ["iron_ingot", "raw_iron"],
    },
    GOLD: {
      names: ["gold_nugget", "gold_ingot", "raw_gold"],
    },
    DIAMOND: {
      names: ["diamond"],
    },
    OBSIDIAN: {
      names: ["obsidian"],
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
