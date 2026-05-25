module.exports = {
    WEAPONS: [
        "diamond_sword", "iron_sword", "stone_sword", "wooden_sword",
        "diamond_axe", "iron_axe", "stone_axe", "wooden_axe"
    ],
    
    AXES: ["wooden_axe", "stone_axe", "iron_axe", "diamond_axe"],
    
    FOOD: ["beef", "porkchop", "chicken", "mutton", "cooked_beef", "cooked_porkchop"],
    
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

    },
    
    ANIMALS: {
        type: "animal",
        names: ["pig", "cow", "sheep", "chicken"],
    },
    HOSTILES: {
        type: "mob",
        names: ["zombie", "skeleton", "spider", "creeper"],
    },
}