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

    let carvedPumpkin = bot.inventory.items().find(item => item.name === 'carved_pumpkin')

    if (!carvedPumpkin) {
        bot.chat("Nemam u inventoryju carved pumpkin, trazim ")

        

        //nadi pumpkin
        const carvedPumpkinBlock = bot.findBlock({
            matching: mcData.blocksByName.carved_pumpkin.id,
            maxDistance: 128
        })

        const pumpkinBlock = bot.findBlock({
            matching: mcData.blocksByName.pumpkin.id,
            maxDistance: 128
        })


        let x, y, z


        if(!carvedPumpkinBlock && !pumpkinBlock) {
            bot.chat("nema nikakvog pumpkina")
            
        } 
        else if(carvedPumpkinBlock){
            bot.chat("Ima carved pumpkina")
            x = carvedPumpkinBlock.position.x   
            y = carvedPumpkinBlock.position.y
            z = carvedPumpkinBlock.position.z
        } 
        else if(pumpkinBlock) {
            bot.chat("Ah ima obicnih, idem shearat")
            x = pumpkinBlock.position.x   
            y = pumpkinBlock.position.y
            z = pumpkinBlock.position.z
        }

        const goal = new GoalNear(x, y, z, 1.0)
        bot.pathfinder.setGoal(goal)

        await new Promise(resolve => bot.once('goal_reached', resolve))


        if(pumpkinBlock && !carvedPumpkinBlock) {
            const shears = bot.inventory.items().find(item => item.name === 'shears')
            if (!shears) {
                bot.chat("Nemam Å¡kare!")
                return
            }
            await bot.equip(shears, 'hand')

            await bot.lookAt(pumpkinBlock.position.offset(0.5, 0.5, 0.5))
            await bot.activateBlock(pumpkinBlock)
            bot.chat("Narezao sam bundevu!")


            await new Promise(resolve => setTimeout(resolve, 500))

            const newCarvedBlock = bot.findBlock({
            matching: mcData.blocksByName.carved_pumpkin.id,
            maxDistance: 10
            })
            if (newCarvedBlock) {
                await bot.dig(newCarvedBlock)
                bot.chat("Pokupljeno!")
            }


        } else if(carvedPumpkinBlock) {
            bot.chat("Tu je taj lijepo narezani pumpkin")
            await bot.lookAt(carvedPumpkinBlock.position.offset(0.5, 0.5, 0.5))
            await bot.dig(carvedPumpkinBlock)
            bot.chat("Pokupljeno!")
        }

        


        

        /////AAAAAAAAAAAAAAAAA

    }

    //nadi pumpkin
    


    ///////////////////AAAAAAAAAAAAAAAAAAAAAAAAAA

    await new Promise(resolve => setTimeout(resolve, 1500))

    carvedPumpkin = bot.inventory.items().find(item => item.name === 'carved_pumpkin')

    if (!carvedPumpkin) {
        bot.chat("Nisam uspio pokupiti carved pumpkin!")
        return
    }
    
    const helmet = bot.inventory.slots[5]
    if (helmet) {
        bot.chat(`Skidam ${helmet.name} s glave...`)
        await bot.unequip('head')
    } 


    await bot.equip(carvedPumpkin, 'head')
    bot.chat("Jesam li zgodan ? ")

    await bot.look(0, 0, true)

})

bot.once('kicked', async() =>{
    bot.chat("Balotelli: Why always me")
})

bot.on('error', (err) => console.log(err))

/*function lookAtNearestPlayer () {
  const playerFilter = (entity) => entity.type === 'player'
  const playerEntity = bot.nearestEntity(playerFilter)
  
  if (!playerEntity) return
  
  const pos = playerEntity.position.offset(0, playerEntity.height, 0)
  bot.lookAt(pos)
}*/