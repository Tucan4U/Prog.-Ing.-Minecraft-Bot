async function shearPumpkin(bot, mcData) {
    //Finding a near by pumpkin block
    const pumpkinBlock = bot.findBlock({
        matching: mcData.blocksByName.pumpkin.id,
        maxDistance: 16
    })

    //Returning if the is no pumpkin block
    if(!pumpkinBlock) {
        bot.chat("There no regular pumpkins near by to shear")
        return
    }
    
    //Returning if the bot can not find shears in his inventory
    const shears = bot.inventory.items().find(item => item.name === 'shears')
    if (!shears) {
        bot.chat("How can I shear. if I have no shears?!")
        return
    }

    //Equipting shears and shearing the pumpking
    await bot.equip(shears, 'hand')
    await bot.lookAt(pumpkinBlock.position.offset(0.5, 0.5, 0.5))
    await bot.activateBlock(pumpkinBlock)
    bot.chat("I sheard the pumpkin!")


    await new Promise(resolve => setTimeout(resolve, 500))

    return
}

module.exports = { shearPumpkin }