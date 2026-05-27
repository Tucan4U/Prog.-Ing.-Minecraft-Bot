function updateWorldSensors(bot, state) {
  const entities = Object.values(bot.entities);
  const items = entities.filter((entity) => entity && entity.name === 'item');

  if (!state.sensors) {
    state.sensors = {};
  }

  state.sensors.entities = entities;
  state.sensors.items = items;
  // Detect dimension changes and announce Nether entry
  const currentDim = bot.game ? bot.game.dimension : null;
  const lastDim = state.sensors.lastDimension || null;
  if (lastDim !== currentDim && currentDim === 'the_nether') {
    // Announce only when the bot has newly entered the Nether dimension.
    try {
      bot.chat('I am in the Nether');
    } catch (err) {
      // ignore chat failures
    }
  }
  state.sensors.lastDimension = currentDim;
  state.sensors.lastUpdatedAt = Date.now();
}

function startWorldSensors(bot, state, options = {}) {
  const intervalMs = options.intervalMs ?? 500;

  updateWorldSensors(bot, state);

  const timer = setInterval(() => {
    updateWorldSensors(bot, state);
  }, intervalMs);

  if (typeof timer.unref === 'function') {
    timer.unref();
  }

  return {
    stop() {
      clearInterval(timer);
    },
    update() {
      updateWorldSensors(bot, state);
    },
  };
}

module.exports = {
  updateWorldSensors,
  startWorldSensors,
};
