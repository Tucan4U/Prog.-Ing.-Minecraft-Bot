// Shared blackboard state: targeti, senzori i aktivni mission profil.
module.exports = {
  currentTarget: null, //Trenutni attack target, koristi se u CombatNode-u
  lootTarget: null, //Itemi koje želimo pokupiti, koristi se u PickUpItemNode-u
  blockTarget: null, //Blok do kojeg želimo doći, koristi se u MoveToBlockNode
  digTask: null, //Dali trenutno bot razbija neki blok, korišteno u MoveToBlockNode i BreakLogNode
  // Block target specifically for blaze spawner searches.
  blazeSpawnerBlock: null,
  // State flag for eating action
  isEating: false,

  isBartering: false,
  needsGold: true,
  neededGold: 64,
  tablePlaced: false,
  enderPearls: null,

  hasEnoughLogs: false,
  hasEnoughStone: false,
  hasEnoughDirt: false,
  mission: {
    activeProfile: "OVERWORLD",
    phase: "END_PREP",
    // This is connected to the craftingTableSequence and it's scoring system
    hasCraftingTable: false,
    // This is connected to the scoring system of the craftWoodenPickaxe
    hasWoodenPickaxe: false,

    hasStonePickaxe: false,
    // Nether portal entry request flag.
    enterNetherRequested: false,
    // Fortress search and travel request flag.
    findFortressRequested: false,
    // Blaze spawner search request flag.
    findBlazeSpawnerRequested: false,
    // Fortress target: { x, y, z } set by LocateFortressNode, used by MoveToFortressNode.
    // y is the surface level (block.y + 1) so the bot aims for the walkable height.
    fortressTarget: null,
    // Mode - AUTONOMOUS or MANUAL
    netherMode : null,
    
    // Blaze hunting state (Blaze rods collection)
    targetBlazeRods: null,
    blazeHuntingRequested: false,
    // Craft-sequence progress cache used to survive repeated BT ticks.
    craftedItems: null,
    // Placed-block progress cache used by block placement sequences.
    placedItems: null,

    craftWoodenPickaxeRequested: false,
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
