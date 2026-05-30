const test = require("node:test");
const assert = require("node:assert/strict");

const { Node, Selector, Sequence } = require("../bt/behaviorTree");

test("Node.tick throws not implemented error", async () => {
  const node = new Node("base");
  await assert.rejects(() => node.tick(), /not implemented/);
});

test("Selector returns SUCCESS when a child succeeds", async () => {
  const selector = new Selector([
    { name: "c1", tick: async () => "FAILURE" },
    { name: "c2", tick: async () => "SUCCESS" },
    { name: "c3", tick: async () => "FAILURE" },
  ]);
  const result = await selector.tick({}, {}, {});
  assert.equal(result, "SUCCESS");
});

test("Selector returns RUNNING when a child is running", async () => {
  const selector = new Selector([
    { name: "c1", tick: async () => "FAILURE" },
    { name: "c2", tick: async () => "RUNNING" },
  ]);
  assert.equal(await selector.tick({}, {}, {}), "RUNNING");
});

test("Selector returns FAILURE when all children fail", async () => {
  const selector = new Selector([
    { name: "c1", tick: async () => "FAILURE" },
    { name: "c2", tick: async () => "FAILURE" },
  ]);
  assert.equal(await selector.tick({}, {}, {}), "FAILURE");
});

test("Sequence returns SUCCESS when all children succeed", async () => {
  const sequence = new Sequence([
    { name: "c1", tick: async () => "SUCCESS" },
    { name: "c2", tick: async () => "SUCCESS" },
  ]);
  assert.equal(await sequence.tick({}, {}, {}), "SUCCESS");
});

test("Sequence returns FAILURE and RUNNING early", async () => {
  const failSequence = new Sequence([
    { name: "c1", tick: async () => "SUCCESS" },
    { name: "c2", tick: async () => "FAILURE" },
    { name: "c3", tick: async () => "SUCCESS" },
  ]);
  assert.equal(await failSequence.tick({}, {}, {}), "FAILURE");

  const runningSequence = new Sequence([
    { name: "c1", tick: async () => "SUCCESS" },
    { name: "c2", tick: async () => "RUNNING" },
  ]);
  assert.equal(await runningSequence.tick({}, {}, {}), "RUNNING");
});
