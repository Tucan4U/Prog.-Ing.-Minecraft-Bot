const { Sequence, Selector } = require('../behaviorTree')

const PickUpItemNode = require('../nodes/pickUpItemNode')
const IdleNode = require('../nodes/idleNode')
const FindBlockNode = require('../nodes/findBlockNode')
const MoveToBlockNode = require('../nodes/moveToBlockNode')
const BreakBlockNode = require('../nodes/breakBlockNode')

const ShearPumpkinNode = require('../nodes/shearPumpkinNode')
const EquipPumpkinNode = require('../nodes/equipPumpkinNode')

const FindMobNode = require('../nodes/findMobNode')
const MoveToMobNode = require('../nodes/moveToMobNode')
const AttackNode = require('../nodes/attackNode')
const FindGatherBlockNode = require('../nodes/findGatherBlockNode')

//SVE NOVO
const LocateStrongholdNode = require('../nodes/locateStrongholdNode')
const EquipGearNode = require('../nodes/equipGearNode')

const MoveToVisibleBlockNode = require('../nodes/moveToVisibleBlockNode')
const MarkStateNode = require('../nodes/markStateNode')

//POKUSAJ TESKI -- gatherBlocks
const ClearStateNode = require('../nodes/clearStateNode')
const WaitNode = require('../nodes/waitNode')

const FillEndPortalFramesNode = require('../nodes/fillEndPortalFramesNode')

const EnterEndPortalNode = require('../nodes/enterEndPortalNode')

//Entity je zasad samo end crystal
const FindEntityNode = require('../nodes/findEntityNode')

//const { getPumpkinHelmetScore } = require('../scores/pumpkinScores')
const { pickUpEndPrepLootScore,collectFeathersScore, collectStringScore, gatherBlocksScore, 
    getPumpkinHelmetScore, locateStrongholdScore, equipGearScore, findEndPortalScore, 
    activateEndPortalScore, enterEndPortalScore,defendSelfScore, } = require('../scores/endPrepScores')

const { destroyEndCrystalScore } = require('../scores/endFightScores')

function createEndProfile(config) {
        const destroyEndCrystalNode = new Sequence([
            new FindEntityNode('end_crystal', 'endCrystalTarget'),

            new MoveToMobNode(
                'endCrystalTarget',
                config.BT.MOVE_NEAR_DISTANCE,
                config.BT.MOVE_SUCCESS_DISTANCE,
                config.BT.MOVE_STATUS_THROTTLE_MS
            ),

            new AttackNode('endCrystalTarget'),
        ])


        // KANDIDAT: Nabavi pumpkin helmet (priprema za Endermane)
        const getPumpkinHelmetNode = new Selector([
            // 1. Ako već imamo pumpkin, equipaj
        new EquipPumpkinNode(),

        // 2. Ako carved_pumpkin leži na podu, pokupi ga
        new Sequence([
            new PickUpItemNode(['carved_pumpkin']),
            new WaitNode(500),
            new EquipPumpkinNode(),
        ]),

        // 3. Ako carved_pumpkin je negdje ublizini, iskopaj ga i pokupi
        new Sequence([
            new FindBlockNode('CARVED_PUMPKINS', 'blockTarget', config.BLOCKS.CARVED_PUMPKINS.maxBlockDistance),
            new MoveToBlockNode('blockTarget', config.BT.MOVE_NEAR_DISTANCE, config.BT.BREAK_RANGE),
            new BreakBlockNode('blockTarget', config.BT.BREAK_RANGE, 'AXES'),
            new WaitNode(500),
            new PickUpItemNode(['carved_pumpkin']),
            new WaitNode(500),
            new EquipPumpkinNode(),
        ]),

        // 4. Ako ga nema, napravi ga
        new Sequence([
            new FindBlockNode('PUMPKINS', 'blockTarget', config.BLOCKS.PUMPKINS.maxBlockDistance),
            new MoveToBlockNode('blockTarget', config.BT.MOVE_NEAR_DISTANCE, config.BT.BREAK_RANGE),
            new ShearPumpkinNode('blockTarget'),
            new BreakBlockNode('blockTarget', config.BT.BREAK_RANGE, 'AXES'),
            new WaitNode(500),
            new PickUpItemNode(['carved_pumpkin']),
            new WaitNode(500),
            new EquipPumpkinNode(),
        ]),




        
    ])

    // KANDIDAT: Pokupi loot od pripreme za End
    const pickUpEndPrepLootNode = new PickUpItemNode([
        'feather',  'string', 'carved_pumpkin', 'ender_eye',
    ])

    const defendSelfNode = new Sequence([
        new MoveToMobNode(
            'attackerTarget',
            config.BT.MOVE_NEAR_DISTANCE,
            config.BT.MOVE_SUCCESS_DISTANCE,
            config.BT.MOVE_STATUS_THROTTLE_MS
        ),
        new AttackNode('attackerTarget'),
    ])

    // KANDIDAT: Ubijaj kokoši dok ne skupiš 64 feathers
    const huntChickensNode = new Sequence([
        new FindMobNode('CHICKENS', 'chickenTarget'),
        new MoveToMobNode(
            'chickenTarget',
            config.BT.MOVE_NEAR_DISTANCE,
            config.BT.MOVE_SUCCESS_DISTANCE,
            config.BT.MOVE_STATUS_THROTTLE_MS
        ),
        new AttackNode('chickenTarget'),
    ])

    // KANDIDAT: Ubijaj pauke dok ne skupiš 64 string
    const huntSpidersNode = new Sequence([
        new FindMobNode('SPIDERS', 'spiderTarget'),
        new MoveToMobNode(
            'spiderTarget',
            config.BT.MOVE_NEAR_DISTANCE,
            config.BT.MOVE_SUCCESS_DISTANCE,
            config.BT.MOVE_STATUS_THROTTLE_MS
        ),
        new AttackNode('spiderTarget'),
    ])

    const gatherBlocksNode = new Sequence([
        new FindGatherBlockNode(
            'gatherBlockTarget',
            config.BLOCKS.GATHER_BLOCKS.maxBlockDistance
        ),
        new MoveToBlockNode(
            'gatherBlockTarget',
            config.BT.MOVE_NEAR_DISTANCE,
            config.BT.BREAK_RANGE
        ),
        new BreakBlockNode(
            'gatherBlockTarget',
            config.BT.BREAK_RANGE,
            null
        ),
        new WaitNode(800),
        new PickUpItemNode([
            'dirt', 'cobblestone', 'cobbled_deepslate', 'oak_log', 'birch_log', 'spruce_log', 'jungle_log',
            'acacia_log', 'dark_oak_log', 'netherrack',
        ]),
        new ClearStateNode('gatherBlockTarget'),
    ])

    const findEndPortalNode = new Sequence([
        new FindBlockNode(
            'END_PORTAL_FRAMES',
            'endPortalFrameTarget',
            config.BLOCKS.END_PORTAL_FRAMES.maxBlockDistance
        ),
        new MoveToVisibleBlockNode(
            'endPortalFrameTarget',
            1,
            4,
            config.BT.MOVE_STATUS_THROTTLE_MS
        ),
        new MarkStateNode(['endPortal', 'found'], true),
    ])

    const activateEndPortalNode = new Sequence([
        new FillEndPortalFramesNode(12),
    ])

    const enterEndPortalNode = new Sequence([
        new EnterEndPortalNode(12),
    ])

    // KASNIJE ĆE OVDJE IĆI:
    // - fightEnderman
    // - destroyEndCrystal  
    // - attackDragon
    // - escapeDragonBreath
    // 

   return {
    candidates: [
        {
            name: 'PickUpEndPrepLoot',
            node: pickUpEndPrepLootNode,
            scoreFn: pickUpEndPrepLootScore,
        },
        {
            name: 'CollectFeathers',
            node: huntChickensNode,
            scoreFn: collectFeathersScore,
        },
        {
            name: 'CollectString',
            node: huntSpidersNode,
            scoreFn: collectStringScore,
        },
        {
            name: 'GetPumpkinHelmet',
            node: getPumpkinHelmetNode,
            scoreFn: getPumpkinHelmetScore,
        },
        {
            name: 'GatherBlocks',
            node: gatherBlocksNode,
            scoreFn: gatherBlocksScore,
        },
        {
            name: 'LocateStronghold',
            node: new LocateStrongholdNode(),
            scoreFn: locateStrongholdScore,
        },
        {
            name: 'EquipGear',
            node: new EquipGearNode(),
            scoreFn: equipGearScore,
        },
        {
            name: 'FindEndPortal',
            node: findEndPortalNode,
            scoreFn: findEndPortalScore,
        },
        {
            name: 'ActivateEndPortal',
            node: activateEndPortalNode,
            scoreFn: activateEndPortalScore,
        },
        {
            name: 'EnterEndPortal',
            node: enterEndPortalNode,
            scoreFn: enterEndPortalScore,
        },
        {
            name: 'DestroyEndCrystals',
            node: destroyEndCrystalNode,
            scoreFn: destroyEndCrystalScore,
        },
        {
            name: 'DefendSelf',
            node: defendSelfNode,
            scoreFn: defendSelfScore,
        },
        {
            name: 'Idle',
            node: new IdleNode(),
            scoreFn: () => 1,
        },
    ],
    fallbackNode: new IdleNode(),
}
}

module.exports = { createEndProfile }