// Shared blackboard state: targeti, senzori i aktivni mission profil.
module.exports = {
  currentTarget: null, //Trenutni attack target, koristi se u CombatNode-u
  lootTarget: null, //Itemi koje želimo pokupiti, koristi se u PickUpItemNode-u
  blockTarget: null, //Blok do kojeg želimo doći, koristi se u MoveToBlockNode
  digTask: null, //Dali trenutno bot razbija neki blok, korišteno u MoveToBlockNode i BreakLogNode
  mission: {
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
    netherMode : null,
  },
  // Block target specifically for blaze spawner searches.
  blazeSpawnerBlock: null,
  sensors: {
    entities: [],
    items: [],
    lastUpdatedAt: 0,
  },
};
