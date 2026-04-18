const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const GoalNear = goals.GoalNear  

const { findAndGetPumpkin } = require("./findAndGetPumpkin.js")
const { shearPumpkin } = require("./shearPumpkin.js")
const { breakPumpkin } = require("./breakPumpkin.js")
const { putOnHead } = require("./putOnHead.js")


const bot = mineflayer.createBot({
    host: 'localhost',
    port: 25565,
    username: 'AnteBot'
})

bot.loadPlugin(pathfinder)

let mcData


bot.once('spawn', async () => {
    bot.chat("Hello, awaiting comads!")

    await new Promise(resolve => setTimeout(resolve, 1500))

    mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)
    movements.scafoldingBlocks = []
    bot.pathfinder.setMovements(movements)
})

bot.on('chat', async (username, message) => {
    if (username === bot.username) return  // ignore own messages

    if (message === 'Locate pumpkin') {
        try {
            await findAndGetPumpkin(bot, mcData)
        } catch (err) {
            console.error("Error in the findAndGetPumpkin function:", err)
            bot.chat("Error happend!")
        }
    }

    else if (message === 'Shear the pumpkin') {
        try {
            await shearPumpkin(bot, mcData)
        } catch (err) {
            console.error("Error in the shearPumpkin function:", err)
            bot.chat("Error happend!")
        }
    }

    else if (message === 'Break the pumpkin') {
        try {
            await breakPumpkin(bot, mcData)
        } catch (err) {
            console.error("Error in the breakPumpkin function:", err)
            bot.chat("Error happend!")
        }
        
    }

    else if (message === 'Put the pumpkin on') {
        try {
            await putOnHead(bot, mcData)
        } catch (err) {
            console.error("Error in the putOnHead function:", err)
            bot.chat("Error happend!")
        }
    }

    else if (message === 'help') {
        bot.chat("Komande: 'nadi pumpkin', 'stavi na glavu'")
    }
})




bot.once('kicked', async() =>{
    bot.chat("Balotelli: Why always me")
})

bot.on('error', (err) => console.log(err))
