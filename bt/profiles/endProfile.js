const { Sequence, Selector } = require('../behaviorTree')

const PickUpItemNode = require('../nodes/pickUpItemNode')
const IdleNode = require('../nodes/idleNode')
const FindBlockNode = require('../nodes/findBlockNode')
const MoveToBlockNode = require('../nodes/moveToBlockNode')
const BreakBlockNode = require('../nodes/breakBlockNode')

const ShearPumpkinNode = require('../nodes/shearPumpkinNode')
const EquipPumpkinNode = require('../nodes/equipPumpkinNode')

const { getPumpkinHelmetScore } = require('../scores/pumpkinScores')

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

    // KASNIJE ĆE OVDJE IĆI:
    // - fightEnderman
    // - destroyEndCrystal  
    // - attackDragon
    // - escapeDragonBreath
    // 

    return {
        candidates: [
            { name: 'GetPumpkinHelmet', node: getPumpkinHelmetNode, scoreFn: getPumpkinHelmetScore },
            { name: 'Idle', node: new IdleNode(), scoreFn: () => 1 },
        ],
        fallbackNode: new IdleNode(),
    }
}

module.exports = { createEndProfile }