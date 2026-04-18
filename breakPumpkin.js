async function breakPumpkin(bot, mcData) {

    //locate nearby carved pumpkin
    //the pumpkin needs to be close so the bot can reach and break it 
    const carvedPumpkinBlock = bot.findBlock({
        matching: mcData.blocksByName.carved_pumpkin.id,
        maxDistance: 8
    })


    if(!carvedPumpkinBlock){
        bot.chat("Where is it?")
        return
    }

    //break the pumpkin block
    await bot.dig(carvedPumpkinBlock)
    bot.chat("Broke the pumpkin!")

    await new Promise(resolve => setTimeout(resolve, 500))
    return
}

module.exports = { breakPumpkin }