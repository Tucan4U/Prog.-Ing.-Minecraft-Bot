// Function to check if we have enough ender eyes to exit the Nether. Returns the count of ender eyes.
function checkEnderEyesPosession(bot, state, config) {
  // In manual mode, the number of ender eyes is not important
  if (state.mission?.netherMode === config.NETHER_MODES.MANUAL) return true;

  const enderEyesNum = bot.registry.itemsByName['ender_eye'];
  const enderEyesCount = enderEyesNum ? bot.inventory.count(enderEyesNum.id, null) : 0;

  //bot.chat(`Ender eyes in posession: ${enderEyesCount}`);
  return enderEyesCount >= 12;
}

function hasBlazeRods(bot, state, config) {
  const blazeRodItem = bot.registry.itemsByName['blaze_rod'];
  const blazeRodCount = blazeRodItem ? bot.inventory.count(blazeRodItem.id, null) : 0;

  return blazeRodCount;
}

module.exports = { checkEnderEyesPosession, hasBlazeRods };