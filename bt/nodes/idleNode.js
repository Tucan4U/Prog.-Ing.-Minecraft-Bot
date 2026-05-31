const { Node } = require('../behaviorTree');

class IdleNode extends Node {
  constructor() {
    super("IdleNode");
  }
  async tick() {
    return 'SUCCESS';
  }
}

module.exports = IdleNode;