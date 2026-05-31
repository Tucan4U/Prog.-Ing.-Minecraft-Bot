const { Node } = require("../behaviorTree");

class ResetFurnaceWorkflowNode extends Node {
  constructor() {
    super("ResetFurnaceWorkflow");
  }

  // Pokušaj zatvoriti furnace container prije čišćenja statea.
  async closeContainerIfNeeded(state) {
    const furnace = state.furnaceContainer;
    if (!furnace) return;

    try {
      await furnace.close();
    } catch (err) {
      console.log("[ResetFurnaceWorkflow] closing furnace container failed:", err);
    }

    state.furnaceContainer = null;
  }

  async tick(bot, state, config) {
    // Očisti cijeli furnace/pit workflow state nakon razbijanja peći.
    await this.closeContainerIfNeeded(state);

    state.furnaceWorkflowStarted = false;
    state.selectedFurnaceItems = null;
    state.reservedFuel = null;
    state.furnaceExpectedCompleteAt = null;
    state.furnaceLoadPhase = null;
    state.furnaceLoadDone = false;
    state.furnaceLoadedAt = null;
    state.furnaceLoadedInputCount = 0;
    state.furnaceLoadedFuelCount = 0;
    state.furnaceCurrentInputName = null;
    state.furnaceCurrentBatchCount = 0;
    state.furnacePlaced = false;
    state.blockTarget = null;
    state.digTask = null;
    state.pitDigTask = null;
    state.pitStartY = null;
    state.pitTargetY = null;
    state.inPit = false;

    console.log("[ResetFurnaceWorkflow] state cleared");
    return "SUCCESS";
  }
}

module.exports = ResetFurnaceWorkflowNode;
