module.exports = {
    WEAPONS: [
        "netherite_sword", "diamond_sword", "iron_sword", "stone_sword", "wooden_sword",
        "diamond_axe", "iron_axe", "stone_axe", "wooden_axe"
    ],
    
    AXES: ["wooden_axe", "stone_axe", "iron_axe", "diamond_axe"],

    // Dodao sam pickaxe za potrebe BT-a, ali može se koristiti i drugdje
    PICKAXES: [
        "wooden_pickaxe", "stone_pickaxe", "iron_pickaxe", "diamond_pickaxe", "netherite_pickaxe"
    ],
    
    FOOD: ["beef", "porkchop", "chicken", "mutton", "cooked_beef", "cooked_porkchop",  "cooked_chicken", "cooked_mutton"],
    
    // Parametri koji utječu na SUCCESS/FAILURE u BT
    BT: {
        MOVE_NEAR_DISTANCE: 2,
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
        END: "END",   // ADDED FOR END MAKRO LIVAJA
    },
    
    BLOCKS: {
        LOGS: {
            names: ["oak_log", "birch_log", "spruce_log", "jungle_log", "acacia_log", "dark_oak_log"],
            maxBlockDistance: 16,
        },
        // Tvoje pumpkin dodano:
        PUMPKINS: {
            names: ["pumpkin"],
            maxBlockDistance: 128,
        },
        CARVED_PUMPKINS: {
            names: ["carved_pumpkin"],
            maxBlockDistance: 128,
        },
        DIRT: {
            names: ["dirt", "grass_block", "coarse_dirt", "podzol", "rooted_dirt"],
            maxBlockDistance: 16,
        },
        COBBLESTONE: {
            names: ["cobblestone", "stone", "cobbled_deepslate"],
            maxBlockDistance: 16,
        },
        SCAFFOLDING: [
            "dirt", "grass_block", "coarse_dirt", "podzol", "rooted_dirt",
            "cobblestone", "stone", "cobbled_deepslate",
            "oak_log", "birch_log", "spruce_log", "jungle_log", "acacia_log", "dark_oak_log",
            "oak_planks", "birch_planks", "spruce_planks",
            "netherrack", "end_stone",
        ],
        GATHER_BLOCKS: {
            names: [
                "dirt", "grass_block", "cobblestone", "stone", "cobbled_deepslate", "oak_log", "birch_log", 
                "spruce_log", "jungle_log", "acacia_log", "dark_oak_log", "netherrack"
            ],
            maxBlockDistance: 32,
        },
        END_PORTAL_FRAMES: {
            names: ["end_portal_frame"],
            maxBlockDistance: 96,
        },

    },

    GATHER_BLOCK_ITEMS: [
        "dirt", "cobblestone", "cobbled_deepslate", "oak_log", "birch_log", "spruce_log", 
        "jungle_log", "acacia_log", "dark_oak_log", "oak_planks", "birch_planks", "spruce_planks", "jungle_planks", 
        "acacia_planks", "dark_oak_planks", "netherrack"
    ],
    
    ANIMALS: {
        type: "animal",
        names: ["pig", "cow", "sheep", "chicken"],
    },
    //RADI lakse implemetacije findAndKillChicken i Spider
    CHICKENS: {
        type: "animal",
        names: ["chicken"],
    },

    SPIDERS: {
        type: "mob",
        names: ["spider", "cave_spider"],
    },
    HOSTILES: {
        type: "mob",
        names: ["zombie", "skeleton", "spider", "creeper"],
    },
}