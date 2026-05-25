const { pathfinder, goals } = require('mineflayer-pathfinder')
const GoalNear = goals.GoalNear 

async function findAndGetPumpkin(bot, mcData) {

    //Waiting for the bot to load his inventory, before checking it
    await new Promise(resolve => setTimeout(resolve, 500))

    let carvedPumpkin = bot.inventory.items().find(item => item.name === 'carved_pumpkin')

    //If bot already has a carved pumpkin, no need to search
    if(carvedPumpkin) {
        bot.chat("What do you mean locate. I have one in my inventory")
        return 
    }



    bot.chat("I do not have a pumpkin in my inventory. I am going to find one ")


    //Locating a regular/carved pumpkin (carved = no shearing needed)
    if (!carvedPumpkin) {

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
            bot.chat("There are no pumpkins near by...")
            return
            
        }
        
        //Choosing do go to the carved pumpkin - he does not need to shear
        else if(carvedPumpkinBlock){
            bot.chat("There is a carved pumpkin near")
            x = carvedPumpkinBlock.position.x   
            y = carvedPumpkinBlock.position.y
            z = carvedPumpkinBlock.position.z

        } 
        //Fall back option - needs to shear
        else if(pumpkinBlock) {
            bot.chat("There is a regular pumpkin near by")
            x = pumpkinBlock.position.x   
            y = pumpkinBlock.position.y
            z = pumpkinBlock.position.z
        }

        //Navigate to the pumpkin 
        const goal = new GoalNear(x, y, z, 1.0)
        bot.pathfinder.setGoal(goal)

        //Waiting to reach the pumpkin
        await new Promise(resolve => bot.once('goal_reached', resolve))

        return

    }


}

module.exports = { findAndGetPumpkin }
