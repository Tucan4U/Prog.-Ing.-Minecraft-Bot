const test = require("node:test");
const assert = require("node:assert/strict");

const { findMobs } = require("../behaviors/findEnteties");
const {
  updateWorldSensors,
  startWorldSensors,
} = require("../sensors/worldSensors");
const { getClosestEntity } = require("../utils/target");
const {
  runThrottled,
  chatThrottled,
  logThrottled,
} = require("../utils/throttle");
const {
  countItemsByNames,
  findInventoryItemByNames,
  findBestInventoryItemByNames,
  getTotalFoodCount,
  hasAnyItem,
  numOfBlocks,
  shouldHuntForFood,
} = require("../utils/inventory");
const config = require("../config");

function makeVec(x, y, z) {
  return {
    x,
    y,
    z,
    distanceTo(other) {
      return Math.sqrt(
        (x - other.x) ** 2 + (y - other.y) ** 2 + (z - other.z) ** 2,
      );
    },
  };
}

test("findMobs returns entities matching type and names", () => {
  const bot = {
    entity: { position: makeVec(0, 0, 0) },
    entities: {},
  };
  const entities = [
    { name: "pig", type: "animal", position: makeVec(1, 0, 0) },
    { name: "zombie", type: "mob", position: makeVec(9, 0, 0) },
    { name: "skeleton", type: "mob", position: makeVec(2, 0, 0) },
  ];
  const result = findMobs(bot, { type: "mob", names: ["skeleton"] }, entities);
  assert.deepEqual(result, [entities[2]]);
  assert.deepEqual(findMobs(bot, null, entities), []);
});

test("world sensor updater snapshots entities and items", () => {
  const bot = {
    entities: {
      e1: { name: "item" },
      e2: { name: "zombie" },
    },
  };
  const state = {};
  updateWorldSensors(bot, state);

  assert.equal(state.sensors.entities.length, 2);
  assert.equal(state.sensors.items.length, 1);
  assert.equal(typeof state.sensors.lastUpdatedAt, "number");
});

test("world sensor service starts periodic updates and can be stopped", async () => {
  const bot = { entities: { e1: { name: "item" } } };
  const state = {};
  const service = startWorldSensors(bot, state, { intervalMs: 10 });

  bot.entities = { e1: { name: "item" }, e2: { name: "item" } };
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.equal(state.sensors.items.length, 2);
  service.stop();
});

test("target helper picks closest entity", () => {
  const bot = { entity: { position: makeVec(0, 0, 0) } };
  const entities = [
    { position: makeVec(7, 0, 0) },
    { position: makeVec(1, 0, 0) },
    { position: makeVec(4, 0, 0) },
  ];
  assert.equal(getClosestEntity(bot, entities), entities[1]);
});

test("throttle helpers throttle callbacks, chat and logs", async () => {
  let callbackRuns = 0;
  assert.equal(
    runThrottled("x", 50, () => callbackRuns++),
    true,
  );
  assert.equal(
    runThrottled("x", 50, () => callbackRuns++),
    false,
  );
  assert.equal(callbackRuns, 1);

  const bot = {
    chatCalls: [],
    chat(msg) {
      this.chatCalls.push(msg);
    },
  };
  assert.equal(chatThrottled(bot, "k", "hello", 50), true);
  assert.equal(chatThrottled(bot, "k", "hello", 50), false);
  assert.equal(bot.chatCalls.length, 1);

  const originalLog = console.log;
  let logs = 0;
  console.log = () => logs++;
  try {
    assert.equal(logThrottled("k", "msg", 50), true);
    assert.equal(logThrottled("k", "msg", 50), false);
    assert.equal(logs, 1);
  } finally {
    console.log = originalLog;
  }

  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(
    runThrottled("x", 50, () => callbackRuns++),
    true,
  );
});

test("inventory helpers count, find, score and classify items", () => {
  const bot = {
    inventory: {
      items: () => [
        { name: "bread", count: 5 },
        { name: "coal", count: 3 },
        { name: "oak_log", count: 12 },
        { name: "oak_log", count: 6 },
      ],
    },
  };

  assert.equal(countItemsByNames(bot, ["bread", "coal"]), 8);
  assert.equal(findInventoryItemByNames(bot, ["coal"]).name, "coal");
  assert.equal(findInventoryItemByNames(bot, ["diamond"]), null);
  assert.equal(findBestInventoryItemByNames(bot, ["oak_log"]).count, 12);
  assert.equal(hasAnyItem(bot, ["bread"]), true);
  assert.equal(hasAnyItem(bot, ["diamond"]), false);
  assert.equal(numOfBlocks(bot, {}, config, "LOGS"), 18);
});

test("total food count includes raw and cooked food", () => {
  const bot = {
    inventory: {
      items: () => [
        { name: "beef", count: 4 },
        { name: "cooked_beef", count: 6 },
        { name: "cooked_chicken", count: 2 },
      ],
    },
  };

  assert.equal(getTotalFoodCount(bot, config), 12);
});

test("hunt hysteresis starts below 10 and stops at 32", () => {
  const state = { foodHuntActive: false };
  const bot = {
    inventory: {
      items: () => [
        { name: "beef", count: 4 },
      ],
    },
  };

  assert.equal(shouldHuntForFood(bot, state, config), true);

  bot.inventory.items = () => [{ name: "cooked_beef", count: 20 }];
  assert.equal(shouldHuntForFood(bot, state, config), true);

  bot.inventory.items = () => [{ name: "cooked_beef", count: 32 }];
  assert.equal(shouldHuntForFood(bot, state, config), false);
});
