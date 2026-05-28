// Shared blackboard state: targeti, senzori i aktivni mission profil.
module.exports = {
  currentTarget: null, //Trenutni attack target, koristi se u CombatNode-u
  lootTarget: null, //Itemi koje želimo pokupiti, koristi se u PickUpItemNode-u
  blockTarget: null, //Blok do kojeg želimo doći, koristi se u MoveToBlockNode
  digTask: null, //Dali trenutno bot razbija neki blok, korišteno u MoveToBlockNode i BreakLogNode
  mission: {
    activeProfile: "OVERWORLD",
  },
  // Furnace workflow state (reserved by PrepareFurnaceMaterialsNode)
  furnaceWorkflowStarted: false,
  furnacePlaced: false,
  selectedFurnaceItems: null,
  reservedFuel: null,
  furnaceExpectedCompleteAt: null,
  furnaceLoadPhase: null,
  furnaceLoadDone: false,
  furnaceLoadedAt: null,
  furnaceLoadedInputCount: 0,
  furnaceLoadedFuelCount: 0,
  furnaceCurrentInputName: null,
  furnaceCurrentBatchCount: 0,
  furnaceContainer: null,
  // Pit digging workflow state
  pitDigTask: null,
  pitStartY: null,
  pitTargetY: null,
  inPit: false,

  sensors: {
    entities: [],
    items: [],
    lastUpdatedAt: 0,
  },
};
