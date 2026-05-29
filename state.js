// Shared blackboard state: targeti, senzori i aktivni mission profil.
module.exports = {
  currentTarget: null, //Trenutni attack target, koristi se u CombatNode-u
  lootTarget: null, //Itemi koje želimo pokupiti, koristi se u PickUpItemNode-u
  blockTarget: null, //Blok do kojeg želimo doći, koristi se u MoveToBlockNode
  digTask: null, //Dali trenutno bot razbija neki blok, korišteno u MoveToBlockNode i BreakLogNode
  mission: {
    activeProfile: "END",
    phase: "END_PREP",
  },
  sensors: {
    entities: [],
    items: [],
    lastUpdatedAt: 0,
  },
};