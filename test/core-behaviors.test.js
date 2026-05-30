const test = require("node:test");
const assert = require("node:assert/strict");

const { attackTarget } = require("../behaviors/combat");
const { findItem } = require("../behaviors/loot");
const state = require("../state");
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

test("state exports expected shared blackboard shape", () => {
  assert.ok(state.mission);
  assert.equal(state.mission.activeProfile, "OVERWORLD");
  assert.ok(state.sensors);
  assert.deepEqual(state.sensors.entities, []);
  assert.deepEqual(state.sensors.items, []);
});

test("config exports expected critical settings", () => {
  assert.ok(Array.isArray(config.WEAPONS));
  assert.ok(config.BT.ATTACK_RANGE > 0);
  assert.equal(config.PROFILES.OVERWORLD, "OVERWORLD");
  assert.ok(Array.isArray(config.BLOCKS.LOGS.names));
});

test("attackTarget does nothing for missing target or out of range", () => {
  const calls = { lookAt: 0, attack: 0 };
  const bot = {
    entity: { position: makeVec(0, 0, 0) },
    lookAt: () => calls.lookAt++,
    attack: () => calls.attack++,
  };

  attackTarget(bot, null);
  attackTarget(bot, { position: makeVec(6, 0, 0) });

  assert.equal(calls.lookAt, 0);
  assert.equal(calls.attack, 0);
});

test("attackTarget attacks when target is in range", () => {
  const calls = { lookAt: 0, attack: 0 };
  const bot = {
    entity: { position: makeVec(0, 0, 0) },
    lookAt: () => calls.lookAt++,
    attack: (_target, withCooldown) => {
      calls.attack++;
      assert.equal(withCooldown, true);
    },
  };
  const target = { position: makeVec(3, 0, 0) };

  attackTarget(bot, target);
  assert.equal(calls.lookAt, 1);
  assert.equal(calls.attack, 1);
});

test("findItem returns first matching dropped item", () => {
  const bot = {
    entities: {
      a: { name: "item", getDroppedItem: () => ({ name: "dirt" }) },
      b: { name: "item", getDroppedItem: () => ({ name: "coal" }) },
      c: { name: "zombie" },
    },
  };

  const found = findItem(bot, ["coal", "iron_ore"]);
  assert.equal(found, bot.entities.b);
});

test("findItem handles invalid filters and absent matches", () => {
  const bot = {
    entities: {
      a: { name: "item", getDroppedItem: () => ({ name: "dirt" }) },
    },
  };
  assert.equal(findItem(bot, null), null);
  assert.equal(findItem(bot, ["coal"]), undefined);
});
