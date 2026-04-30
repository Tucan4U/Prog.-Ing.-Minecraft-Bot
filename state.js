// Shared blackboard state: targeti, senzori i aktivni mission profil.
module.exports = {
  currentTarget: null,   //Trenutni attack target, koristi se u CombatNode-u
  lootTarget: null,      //Itemi koje želimo pokupiti, koristi se u PickUpItemNode-u
  mission: {
    activeProfile: 'OVERWORLD',
  },
  sensors: {
    entities: [],
    items: [],
    lastUpdatedAt: 0,
  },
};