const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const GoalNear = goals.GoalNear  

const bot = mineflayer.createBot({
    host: 'localhost',
    port: 25565,
    username: 'AnteBot'
})

bot.loadPlugin(pathfinder)



bot.once('spawn', async () => {
    bot.chat("Rodio sam se")

    await new Promise(resolve => setTimeout(resolve, 1500))

    const mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)
    movements.scafoldingBlocks = []
    bot.pathfinder.setMovements(movements)

    
    //nadi pumpkin
    const pumpkinBlock = bot.findBlock({
        matching: mcData.blocksByName.pumpkin.id,
        maxDistance: 128
    })

    if (!pumpkinBlock) {
        bot.chat("Stari moj, tu je nema!")
        return
    }

    // x, y, z koridinate pumpkin bloka
    const x = pumpkinBlock.position.x   
    const y = pumpkinBlock.position.y

    const z = pumpkinBlock.position.z
    const goal = new GoalNear(x, y, z, 2.5)
    bot.pathfinder.setGoal(goal)


    //cekaj da dode do te bundeve
    await new Promise(resolve => bot.once('goal_reached', resolve))

    //equiptaj shears, ako ih ima
    const shears = bot.inventory.items().find(item => item.name === 'shears')
    if (!shears) {
        bot.chat("Nemam škare!")
        return
    }
    await bot.equip(shears, 'hand')

    await bot.lookAt(pumpkinBlock.position.offset(0.5, 0.5, 0.5))
    await bot.activateBlock(pumpkinBlock)
    bot.chat("Narezao sam bundevu!")


})

bot.once('kicked', async() =>{
    bot.chat("Balotelli: Why always me")
})

bot.on('error', (err) => console.log(err))
