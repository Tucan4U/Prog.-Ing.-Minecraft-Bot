const { pathfinder, goals } = require('mineflayer-pathfinder')
const GoalFollow = goals.GoalFollow

async function findChicken(bot, mcData) {

    //Locate the nearst chicken 
    const chicken = bot.nearestEntity(entity => 
        entity.name === 'chicken' && 
        entity.position.distanceTo(bot.entity.position) <= 64
    )

    if (!chicken) {
        bot.chat("No chickens nearby!")
        return
    }

    bot.chat("Found a chicken, going to it..")

    //Move close to the chicken
    await new Promise(resolve => {
        const check = setInterval(() => {
            const dist = bot.entity.position.distanceTo(chicken.position)
            if (dist <= 2) {
                clearInterval(check)
                resolve()
            }
        }, 500)

        let goal = new GoalFollow(chicken,2)
        bot.pathfinder.setGoal(goal, true)
    })

    bot.chat("I found the chicken, now it is time ....")

    //Equip a sword or axe if available
    const weapon = bot.inventory.items().find(item => 
        item.name.includes('sword') || item.name.includes('axe')
    )

    if(weapon) {
        await bot.equip(weapon, 'hand')
    } 
   

    //Attack until the chicken is dead
    while (chicken.isValid) {
        await bot.attack(chicken)
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    bot.chat("Chicken is dead")
    return
}

module.exports = { findChicken }