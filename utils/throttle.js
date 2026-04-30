const lastRunByKey = new Map();

function runThrottled(key, intervalMs, callback) {
  const now = Date.now();
  const lastRunAt = lastRunByKey.get(key) || 0;

  if (now - lastRunAt < intervalMs) {
    return false;
  }

  callback();
  lastRunByKey.set(key, now);
  return true;
}

function chatThrottled(bot, key, message, intervalMs = 3000) {
  return runThrottled(`chat:${key}`, intervalMs, () => {
    bot.chat(message);
  });
}

function logThrottled(key, message, intervalMs = 3000) {
  return runThrottled(`log:${key}`, intervalMs, () => {
    console.log(message);
  });
}

module.exports = {
  runThrottled,
  chatThrottled,
  logThrottled,
};
