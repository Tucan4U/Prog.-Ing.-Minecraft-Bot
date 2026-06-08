const { Node } = require("../behaviorTree");

const NEIGHBOR_OFFSETS = [
	[1, 0, 0],
	[-1, 0, 0],
	[0, 0, 1],
	[0, 0, -1],
    [0, 1, 0],
	[0, -1, 0],
];

function getBlockKey(position) {
	return `${position.x}:${position.y}:${position.z}`;
}

function isSourceLavaBlock(block) {
	if (!block || block.name !== "lava") return false;

	const level = block._properties?.level;
	return level === 0 || level === "0";
}

function isLavaPool(block, state, bot, maxBlocks = 10) {
    if (!isSourceLavaBlock(block)) {
		state[this.stateKey] = null;
		return false;
	}

    const queue = [block];
    const visited = new Set([getBlockKey(block.position)]);
    const lavaPoolBlocks = [];

    while (queue.length > 0 && lavaPoolBlocks.length < maxBlocks) {
        const current = queue.shift();
        lavaPoolBlocks.push(current);

        for (const [dx, dy, dz] of NEIGHBOR_OFFSETS) {
            const neighborPosition = current.position.offset(dx, dy, dz);
            const neighborKey = getBlockKey(neighborPosition);
            if (visited.has(neighborKey)) continue;

            visited.add(neighborKey);
            const neighborBlock = bot.blockAt(neighborPosition);
            if (isSourceLavaBlock(neighborBlock)) {
                queue.push(neighborBlock);
            }
        }
    }
    if (lavaPoolBlocks.length < maxBlocks) {
        console.log(`Found only ${lavaPoolBlocks.length} lava blocks, which is less than the required ${maxBlocks}`);
        return false;
    }
    console.log(`Lava pool detected with ${lavaPoolBlocks.length} source blocks.`);
    return true;
}

class DetectLavaPoolNode extends Node {
	constructor(stateKey = "blockTarget", maxBlocks = 10) {
		super("DetectLavaPool");
		this.stateKey = stateKey;
		this.maxBlocks = maxBlocks;
        this.configKey = "LAVA";
        this.mcData = null;
	}

	async tick(bot, state, config) {
        if (!this.mcData) {
            this.mcData = require("minecraft-data")(bot.version);
        }
		const target = state[this.stateKey];
		if (!target) {
			state[this.stateKey] = null;
			return "FAILURE";
		}

        if(!target.name.includes("lava")){
            for(let [dx, dy, dz] of NEIGHBOR_OFFSETS){
                const neighborPos = target.position.offset(dx, dy, dz);
                const neighborBlock = bot.blockAt(neighborPos);
                console.log(`${neighborBlock.name} at ${neighborPos}`);
                if(neighborBlock.name.includes("lava")){
                    //console.log(`Target block is not lava but has lava neighbor at ${neighborPos}. Updating target.`);
                    state[this.stateKey] = neighborBlock;
                    return "RUNNING";
                }
            }
            state[this.stateKey] = null;
            return "FAILURE";
        } 

		const startBlock = bot.blockAt(target.position);
        if(isLavaPool(startBlock, state, bot, this.maxBlocks)){
            console.log("Lava pool already targeted at: ", target.position);
            state.lavaSearchDistance = 16; // Reset search distance for future detections
            return "SUCCESS";  
        } 
		
        if(startBlock.name.includes("obsidian")){
            console.log("Water successfully placed at: ", target.position);
            return "SUCCESS";
        } 

        if(state.lavaSearchDistance > 4096) {
            console.log(`Search distance exceeded reasonable limits.`);
            return "FAILURE";
        }
        const blocks = bot.findBlocks({
            maxDistance: state.lavaSearchDistance,
            matching: config.BLOCKS[this.configKey].names
                .map((name) => this.mcData.blocksByName[name]?.id)
                .filter(Boolean),
            count: this.maxBlocks,
        })
        for(let block of blocks){
            let blockInfo = bot.blockAt(block);
            if(isLavaPool(blockInfo, state, bot, this.maxBlocks)){ 
                state[this.stateKey] = blockInfo; 
                state.lavaSearchDistance = 16; 
                return "SUCCESS"; }
        }
        console.log(`No lava pool found within ${state.lavaSearchDistance} blocks. Expanding search radius.`);
        state.lavaSearchDistance *= 2;
        return "RUNNING"; 
	}
}


module.exports = DetectLavaPoolNode;
