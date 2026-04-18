const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const GoalNear = goals.GoalNear  

// Importing all bot commands from separate files
const { findAndGetPumpkin } = require("./findAndGetPumpkin.js")
const { shearPumpkin } = require("./shearPumpkin.js")
const { breakPumpkin } = require("./breakPumpkin.js")
const { putOnHead } = require("./putOnHead.js")
const { findChicken } = require("./findChicken.js")
const { gatherDirt } = require("./gatherDirt.js")
const { listInventory } = require("./listInventory.js")
const { pickupItems, pickupNearbyItems } = require("./pickupNearbyItems.js")

const TARGET_AMOUNT = 64  //Number of blocks need before stopping


const bot = mineflayer.createBot({
    host: 'localhost',
    port: 25565,
    username: 'AnteBot'
})

bot.loadPlugin(pathfinder)

let mcData
let stopRequested = false  //Flag to signal long-running tasks (like gatherDirt) to stop early

function shouldStop() {
    return stopRequested
}


//On spawn - wait for chunks to load, set up movement settings
bot.once('spawn', async () => {
    bot.chat("Hello, awaiting commads!")

    await new Promise(resolve => setTimeout(resolve, 1500))

    mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)
    movements.scafoldingBlocks = []
    bot.pathfinder.setMovements(movements)
})

//Listen for player chat commands and call the matching function
bot.on('chat', async (username, message) => {
    //bot ignores his owmn messages
    if (username === bot.username) return  

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

    else if (message === 'Find chicken') {
        try {
            await findChicken(bot, mcData)
        } catch (err) {
            console.error("Error in the findChicken function:", err)
            bot.chat("Error happend!")
        }
    }

    else if (message === 'gather blocks'){
        try{
            await gatherDirt(bot, TARGET_AMOUNT, mcData, shouldStop)
        } catch (err){
            console.error("Error in the gatherDirt function:", err)
            bot.chat("Error happend!")
        }
    }

    else if (message === 'inventory'){
        try{
            await listInventory(bot)
        } catch (err){
            console.error("Error in the listInventory function:", err)
            bot.chat("Error happened!")
        }
    }

    else if (message === 'pickup'){
        try{
            await pickupNearbyItems(bot, shouldStop)
        } catch (err){
            console.error("Error in the pickupItems function:", err)
            bot.chat("Error happend!")
        }
    }

    else if (message === 'help') {
        bot.chat("Try some of these commands: 'Locate pumpkin', 'Shear the pumpkin', 'Put the pumpkin on', 'Break the pumpkin', 'Find chicken'.")
    }

})


bot.once('kicked', async() =>{
    bot.chat("Balotelli: Why always me")
})

bot.on('error', (err) => console.log(err))