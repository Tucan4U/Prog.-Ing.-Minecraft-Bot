// u ovom configu držimo sve statične podatke koji se koriste na više mjesta u kodu, 
// npr. lista oružja, hrane, životinja itd.

module.exports = {
  WEAPONS: [
    'diamond_sword', 'diamond_axe',
    'iron_sword', 'iron_axe',
    'golden_sword', 'golden_axe',
    'stone_sword', 'stone_axe',
    'wooden_sword', 'wooden_axe',
    'diamond_pickaxe', 'iron_pickaxe',
    'stone_pickaxe', 'wooden_pickaxe'
  ],

  FOOD: [
    'beef', 'porkchop', 'chicken', 'mutton',
    'cooked_beef', 'cooked_porkchop', 'cooked_chicken', 'cooked_mutton', 
  ],
  BT: {
    MOVE_NEAR_DISTANCE: 2,
    MOVE_SUCCESS_DISTANCE: 3,
    ATTACK_RANGE: 4,
    MOVE_STATUS_THROTTLE_MS: 3000,
  },
  SENSORS: {
    WORLD_UPDATE_MS: 500,
  },
  PROFILES: {
    OVERWORLD: 'OVERWORLD',
    HOSTILE_COMBAT: 'HOSTILE_COMBAT',
  },
 // MOBOVI
 // Tu se nalaze liste mobova koje se koriste kao argumenti u FindMobNode-u
 // Svaki entry ima tip(npr. animal, hostile, mob) i listu imena mobova.
 // za dodati nove mobove potrebno je pogledat mc_data: https://github.com/PrismarineJS/minecraft-data/blob/master/data/pc/1.21.11/entities.json
 // u budućnosti ako lista treba sadržavat mobove različiith tipova trebat će samo promijenit findEntities funkciju da trazi samo po imenu.
 ANIMALS: {
    type: 'animal',
    names: ['pig', 'cow', 'sheep', 'chicken']
  },
  HOSTILES: {
    type: 'mob',
    names: ['zombie', 'skeleton', 'spider', 'creeper']
  },
  SLIMES: {
    type: 'mob',
    names: ['slime']
  }
};