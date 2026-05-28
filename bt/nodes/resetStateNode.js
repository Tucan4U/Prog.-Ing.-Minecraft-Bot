const { Node } = require("../behaviorTree");
const resetState = require("../../utils/resetState");

class ResetStateNode extends Node {
  constructor() {
    super("ResetState");
  }

  async tick(bot) {
    resetState(bot);
    return "SUCCESS";
  }
}

module.exports = ResetStateNode;