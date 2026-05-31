const { Node } = require("../behaviorTree");
const {
  countItemsByNames,
  findBestInventoryItemByNames,
  hasAnyItem,
} = require("../../utils/inventory");

/**
 * prepareFurnaceMaterialsNode
 *
 * Svrha:
 * - Provjerava inventar za pećnicu, input iteme (npr. sirovo meso, sirovi željezo) i gorivo.
 * - Izračunava koliko itema će se obrađivati i koliko goriva je potrebno.
 * - Rezervira te stavke u globalnom `state` (da drugi BT kandidati ne ukradu resurse).
 * - Postavlja `state.furnaceExpectedCompleteAt` kako bi `wait` node znao kada završiti.
 *
 * Ulazi (constructor):
 * - `configKeyOrItems`: string config ključa (npr. "RAWFOOD") ili array imena itema.
 * - `fuelNamesKeyOrArray`: string config ključa (npr. "FUEL") ili array item imena koja se smatraju gorivom.
 * - `expectedMsPerItem`: opcionalno overridanje vremena po itemu u ms.
 *
 * State (modificira):
 * - `state.selectedFurnaceItems` = [ {name, count}, ... ]
 * - `state.reservedFuel` = { name, count }
 * - `state.furnaceExpectedCompleteAt` = timestamp (ms)
 *
 * Povratna vrijednost: 'SUCCESS' ako su uvjeti zadovoljeni i rezervacije su postavljene, 'FAILURE' inače.
 */
class PrepareFurnaceMaterialsNode extends Node {
  constructor(configKeyOrItems, fuelNamesKeyOrArray, expectedMsPerItem = null) {
    super("prepareFurnaceMaterials");
    this.configKeyOrItems = configKeyOrItems;
    this.fuelNamesKeyOrArray = fuelNamesKeyOrArray;
    this.expectedMsPerItem = expectedMsPerItem;
  }

  async tick(bot, state, config) {
    if (state.furnaceWorkflowStarted || state.furnaceLoadPhase) {
      return "SUCCESS";
    }

    // 1) Resolve popis itema za obradu
    const itemsToProcess = Array.isArray(this.configKeyOrItems)
      ? this.configKeyOrItems
      : config?.[this.configKeyOrItems] || [];

    // 2) Resolve popis goriva
    const fuelNames = Array.isArray(this.fuelNamesKeyOrArray)
      ? this.fuelNamesKeyOrArray
      : config?.[this.fuelNamesKeyOrArray] || [];

    // 3) Provjeri imamo li pećnicu u inventaru
    const hasFurnace = hasAnyItem(bot, config?.BLOCKS?.FURNACE?.names || ["furnace"]);
    if (!hasFurnace){
      bot.chat("No furnace found.");
      return "FAILURE";
    }

    // 4) Sastavi listu itema koje ćemo obraditi i zbroji ih
    const selected = [];
    let totalItems = 0;
    for (const name of itemsToProcess) {
      const count = countItemsByNames(bot, [name]);
      if (count > 0) {
        selected.push({ name, count });
        totalItems += count;
      }
    }
    if (totalItems === 0){
      bot.chat("No items to smelt.");
      return "FAILURE"; // nema stvari za peći
    }

    // 5) Procijeni trajanje i potrebnu količinu goriva.
    // Za testiranje koristimo jednostavan model: 1 fuel unit pokriva N itema.
    const msPerItem = this.expectedMsPerItem || config?.FURNACE?.TIME_PER_ITEM_MS || 10000;
    const totalMs = totalItems * msPerItem;
    const itemsPerFuelUnit = config?.FURNACE?.ITEMS_PER_FUEL_UNIT || 8;
    const fuelNeededUnits = Math.max(1, Math.ceil(totalItems / itemsPerFuelUnit));
    const safetyExtra = 1; // reserve one extra unit to avoid mid-session fuel starve

    // Ukupna količina goriva u inventaru, bez obzira na pojedini stack.
    const fuelTotal = countItemsByNames(bot, fuelNames);

    // 6) Nađi najbolji (najveći) stack goriva
    const bestFuel = findBestInventoryItemByNames(bot, fuelNames, (item) => item.count);
    if (!bestFuel) {
      bot.chat("No fuel found.");
      return "FAILURE"; // nema goriva
    }

    // Ako goriva ukupno nema dovoljno, baci FAILURE prije daljnjih koraka.
    const requiredWithExtra = fuelNeededUnits + safetyExtra;
    if (fuelTotal < requiredWithExtra) {
      bot.chat(`Not enough fuel: need ${requiredWithExtra} units (including extra), have ${fuelTotal} units total.`);
      return "FAILURE"; // nema dovoljno goriva ukupno
    }

    // 7) Rezerviraj u state kako bi drugi nodovi znali da su resursi zauzeti
    state.furnaceWorkflowStarted = true;
    state.selectedFurnaceItems = selected;
    state.reservedFuel = { name: bestFuel.name, count: fuelNeededUnits + safetyExtra };
    state.furnaceExpectedCompleteAt = Date.now() + totalMs;

    // 8) Debug/log poruka - korisno za testiranje
    try {
      if (bot.chat) bot.chat(`Prepared to smelt ${totalItems} items; ETA ${Math.round(totalMs/1000)}s`);
    } catch (e) {
      // ne prekidaj zbog chat greške
    }

    return "SUCCESS";
  }
}

module.exports = PrepareFurnaceMaterialsNode;
