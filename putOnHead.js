async function putOnHead(bot, mcData) {
    
    
    //Checking to see if the bot has a pumpkin in his inventory
    const carvedPumpkin = bot.inventory.items().find(item => item.name === 'carved_pumpkin')

    if(!carvedPumpkin) {
        bot.chat("I can not put on, what i do not have")
        return
    }

    //Removing a helmet, if he is wearing one
    const helmet = bot.inventory.slots[5]
    if (helmet) {
        bot.chat(`Skidam ${helmet.name} s glave...`)
        await bot.unequip('head')
    } 

    //Putting on the helmet
    await bot.equip(carvedPumpkin, 'head')
    bot.chat("Do I look good?")

    return
}

module.exports = { putOnHead }
