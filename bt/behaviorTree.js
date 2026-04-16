class Node {
  constructor(name) {
    this.name = name;
  }

  async tick() {
    throw new Error("tick() not implemented");
  }
}

// Selector: Pokušava izvršiti svako dijete redom dok jedno ne uspije (SUCCESS) ili se ne izvršava (RUNNING). 
// Ako nijedno dijete ne uspije, Selector vraća FAILURE.

class Selector extends Node {
  constructor(children) {
    super("Selector");
    this.children = children;
  }

  async tick(bot, state, config, depth = 0) { // depth je za logiranje, da se vidi struktura stabla

  if (depth === 0) console.log("\n[TICK]");

  for (const child of this.children) {

    const indent = ' '.repeat(depth * 2); // ovo je samo za debug, ali dosta bitno.

    console.log(`${indent}→ ${child.name}`);

    const result = await child.tick(bot, state, config, depth + 1);

    console.log(`${indent}  = ${result}`);

    if (result === 'SUCCESS' || result === 'RUNNING') {
      return result;
    }
  }

  return 'FAILURE';
}
}

// Sequence: Pokušava izvršiti svako dijete redom dok jedno ne ne uspije (FAILURE) ili se ne izvršava (RUNNING). 
// Ako se sva djeca izvrše, Sequence vraća SUCCESS.

class Sequence extends Node {
  constructor(children) {
    super("Sequence");
    this.children = children;
  }

  async tick(bot, state, config, depth = 0) {

  const indent = ' '.repeat(depth * 2);

  for (const child of this.children) {

    const childIndent = ' '.repeat((depth + 1) * 2);

    console.log(`${childIndent}↳ ${child.name}`);

    const result = await child.tick(bot, state, config, depth + 1);

    console.log(`${childIndent}  = ${result}`);

    if (result === 'FAILURE') return 'FAILURE';
    if (result === 'RUNNING') return 'RUNNING';
  }

  return 'SUCCESS';
}
}

module.exports = { Node, Selector, Sequence };