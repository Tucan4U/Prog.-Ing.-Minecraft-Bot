const { Node } = require("../behaviorTree");
const { findInventoryItemByNames } = require("../../utils/inventory");

let NEIGHBOR_OFFSETS = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 0, 1],
    [0, 0, -1],
];


class PlaceWaterNode extends Node {
    constructor(configKey) {
        super("PlaceWater");
        this.configKey = configKey;
        this.newTargetBlock = null;
    }

    async tick(bot, state, config) {
        const targetBlock = state[this.configKey];
        if (!targetBlock) {
            console.log(`[PlaceWater] No target block`);
            return "FAILURE";
        }


        for(let [dx, dy, dz] of NEIGHBOR_OFFSETS){
            const neighborPos = targetBlock.position.offset(dx, dy, dz);
            const neighborBlock = bot.blockAt(neighborPos);
            if(!neighborBlock.name.includes("air") && !neighborBlock.name.includes("lava")){
                console.log(`[PlaceWater] Neighbor block at ${neighborPos} is not air or lava: ${neighborBlock.name}`);
                this.newTargetBlock = neighborBlock;
                break;
            }
        }
        if(!this.newTargetBlock){
            NEIGHBOR_OFFSETS = NEIGHBOR_OFFSETS.map(([dx, dy, dz]) => [dx + 1, dy + 1, dz + 1]);
            console.log(`[PlaceWater] No valid neighbor blocks found. Expanding search to next layer.`);
            return "FAILURE";
        }



        try {
            const waterBlock = bot.blockAt(this.newTargetBlock.position.offset(0, 1, 0));
            if (waterBlock.name.includes("water")) {
                console.log("Water placed successfully at: ", this.newTargetBlock.position);
                return "SUCCESS";
            }
            // 1. Equip bucket
            const water_bucket = findInventoryItemByNames(bot, ["water_bucket"]);
            if (!water_bucket) {
                console.log("[PlaceWater] No water bucket");
                return "FAILURE";
            }

            if (bot.heldItem?.type !== water_bucket.type) {
                await bot.equip(water_bucket, "hand");     
            }

            // 2. VAŽNO: Provjeri poziciju bota
            const botPos = bot.entity.position;
            console.log(`[Debug] Bot position: ${botPos}, standing on: ${bot.blockAt(botPos.offset(0, -1, 0)).name}`);

            // 3. Gledaj precizno u centar bloka
            const lookPos = this.newTargetBlock.position.offset(0.5, 0.5, 0.5);
            await bot.lookAt(lookPos, true);
            bot.waitForTicks(8);   // više vremena za 1.21

            // 4. Pokušaj aktivirati
            await bot.activateItem();

            return "RUNNING";

        } catch (e) {
            console.log(`[PlaceWater] Error: ${e.message}`);
            return "FAILURE";
        }
    }
}

module.exports = PlaceWaterNode;