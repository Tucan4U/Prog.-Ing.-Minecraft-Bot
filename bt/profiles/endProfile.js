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

const { getPumpkinHelmetScore } = require('../scores/pumpkinScores')
const { pickUpEndPrepLootScore,collectFeathersScore, collectStringScore, } = require('../scores/endPrepScores')

function createEndProfile(config) {
        // KANDIDAT: Nabavi pumpkin helmet (priprema za Endermane)
        const getPumpkinHelmetNode = new Selector([
            // 1. Ako već imamo pumpkin, equipaj
        new EquipPumpkinNode(),

        // 2. Ako carved_pumpkin leži na podu, pokupi ga
        new Sequence([
            new PickUpItemNode(['carved_pumpkin']),
            new EquipPumpkinNode(),
        ]),

        // 3. Ako carved_pumpkin je negdje ublizini, iskopaj ga i pokupi
        new Sequence([
            new FindBlockNode('CARVED_PUMPKINS', 'blockTarget', config.BLOCKS.CARVED_PUMPKINS.maxBlockDistance),
            new MoveToBlockNode('blockTarget', config.BT.MOVE_NEAR_DISTANCE, config.BT.BREAK_RANGE),
            new BreakBlockNode('blockTarget', config.BT.BREAK_RANGE, 'AXES'),
        ]),

        // 4. Ako ga nema, napravi ga
        new Sequence([
            new FindBlockNode('PUMPKINS', 'blockTarget', config.BLOCKS.PUMPKINS.maxBlockDistance),
            new MoveToBlockNode('blockTarget', config.BT.MOVE_NEAR_DISTANCE, config.BT.BREAK_RANGE),
            new ShearPumpkinNode('blockTarget'),
            new BreakBlockNode('blockTarget', config.BT.BREAK_RANGE, 'AXES'),
        ]),

        
    ])

    // KANDIDAT: Pokupi loot od pripreme za End
    const pickUpEndPrepLootNode = new PickUpItemNode([
        'feather',
        'chicken',
        'cooked_chicken',
        'string',
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
            name: 'Idle',
            node: new IdleNode(),
            scoreFn: () => 1,
        },
    ],
    fallbackNode: new IdleNode(),
}
}

module.exports = { createEndProfile }