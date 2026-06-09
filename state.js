// Shared blackboard state: targeti, senzori i aktivni mission profil.
module.exports = {
  currentTarget: null, //Trenutni attack target, koristi se u CombatNode-u
  lootTarget: null, //Itemi koje želimo pokupiti, koristi se u PickUpItemNode-u
  blockTarget: null, //Blok do kojeg želimo doći, koristi se u MoveToBlockNode
  digTask: null, //Dali trenutno bot razbija neki blok, korišteno u MoveToBlockNode i BreakLogNode

  buildingPortal: false, //Flag koji označava da bot trenutno gradi portal, koristi se za specijalno ponašanje tijekom gradnje portala (npr. ignoriranje bloka portala kao targeta)
  netherPortalBuilt : false, //Flag koji označava da je portal izgrađen, koristi se za pokretanje fortress searcha nakon gradnje portala
  // Block target specifically for blaze spawner searches.
  blazeSpawnerBlock: null,
  
  mission: {
    craftStage: null,

    activeProfile: "OVERWORLD",
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
    netherMode: null,
    // Placed-block progress cache used by block placement sequences.
    placedItems: null,
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
  furnaceProtection: false, // Flag to indicate if the bot is currently in a state where it should avoid placing blocks near the furnace (e.g. during loading/unloading).

  // Pit digging workflow state
  pitDigTask: null,
  pitStartY: null,
  pitTargetY: null,
  inPit: false,

  //Crafting workflow state
  craftedItems: null, // Craft-sequence progress cache used to survive repeated BT ticks.
  

  // Inventory memory for tracking what the bot has seen in its inventory, to avoid relying solely on the current state of the inventory which might be mid-operation (e.g. during crafting or furnace loading).
  hasEnoughLogs: false,
  hasEnoughStone: false,
  hasEnoughDirt: false,

  hasEnoughCoal: false,
  hasEnoughRawIron: false,
  hasEnoughRawGold: false,
  hasEnoughDiamonds: false,
  hasEnoughObsidian: false,

  hasCraftingTable: false,
  hasFurnace: false,
  hasWoodenPickaxe: false,
  hasStonePickaxe: false,
  hasStoneAxe: false,
  hasIronPickaxe: false,
  hasDiamondPickaxe: false,
  hasDiamondSword: false,

  hasIronArmor: false,
  hasDiamondArmor: false,
  hasBucket: false,
  hasWaterBucket: false,
  hasFlint: false,
  hasFlintAndSteel: false,
  hasShield: false,
  hasGoldenHelmet: false,

  foodHuntActive: false,

  lavaSearchDistance: 16, // Configurable max distance for lava pool detection, used in DetectLavaPoolNode
  sensors: {
    entities: [],
    items: [],
    lastUpdatedAt: 0,
  },
};
