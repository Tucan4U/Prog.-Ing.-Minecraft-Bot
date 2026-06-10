const state = require("../state");


// Resets state variables to their default values.
function resetState(bot) {
  for (const key in state.mission) {
    if (state.mission[key] === true) {
        state.mission[key] = false;
    }
  }
  state.craftedItems = null;
  state.mission.placedItems = null;
  for (const key in state.sensors) {
    if (Array.isArray(state.sensors[key])) {
        state.sensors[key] = [];
    } else {
        state.sensors[key] = 0;
    }
  }
    for (const key in state) {
        if (key !== "mission" && key !== "sensors") {
            state[key] = null;
        }
    }
    // Reset pathfinder goal to stop any ongoing movement.
    bot.pathfinder.setGoal(null);
}

module.exports = resetState;