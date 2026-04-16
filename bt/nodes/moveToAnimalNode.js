const { Node } = require('../behaviorTree');
const { goals } = require('mineflayer-pathfinder');

class MoveToAnimalNode extends Node {
  constructor() {
    super("MoveToAnimal");

    this.lastGoal = null; // cache da ne spamamo pathfinder, ako se target pomakne dovoljno da treba novi path, onda se updatea inace ne(velika usteda)
  }

  async tick(bot, state) {

    const target = state.currentTarget;

    // nema targeta → ne možemo raditi
    if (!target) {
      return 'FAILURE';
    }

    // target više ne postoji
    if (!bot.entities[target.id]) {
      state.currentTarget = null;
      return 'FAILURE';
    }

    const dist = bot.entity.position.distanceTo(target.position);

    // dovoljno blizu → gotovo kretanje
    if (dist < 3) {
      return 'SUCCESS';
    }

    // postavi goal SAMO ako se promijenio
    const goal = `${target.position.x}:${target.position.y}:${target.position.z}`;
    //const goal = target.id; // alternativno, ali može biti problem ako se target pomakne a goal ostane isti jer je baziran na ID-u

    if (this.lastGoal !== goal) {
      bot.pathfinder.setGoal(new goals.GoalNear(
        target.position.x,
        target.position.y,
        target.position.z,
        2
      ));

      this.lastGoal = goal;
    }

    return 'RUNNING';
  }
}

module.exports = MoveToAnimalNode;