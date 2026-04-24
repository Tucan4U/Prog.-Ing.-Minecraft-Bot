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
    'cooked_beef', 'cooked_porkchop'
  ],

  ANIMALS: ['pig', 'cow', 'sheep', 'chicken'],

  LOG_TARGET_COUNT: 10,
};