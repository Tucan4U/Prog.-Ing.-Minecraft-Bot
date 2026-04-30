const { Node } = require('../behaviorTree');

class ConditionNode extends Node {
  constructor(name, conditionFn, child) {
    super(name);
    this.conditionFn = conditionFn;
    this.child = child;
  }

  async tick(bot, state, config, depth = 0) {

    const indent = ' '.repeat(depth * 2);

    let condition = false;
    try {
      condition = await Promise.resolve(this.conditionFn(bot, state, config));
    } catch (err) {
      console.log(`${indent}? ${this.name}: ERROR (${err.message})`);
      return 'FAILURE';
    }

    console.log(`${indent}? ${this.name}: ${condition}`);

    if (!condition) {
      return 'FAILURE';
    }

    return await this.child.tick(bot, state, config, depth + 1);
  }
}

module.exports = ConditionNode;