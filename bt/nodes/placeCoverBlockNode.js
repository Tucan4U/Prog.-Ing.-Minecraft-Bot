const { Node } = require("../behaviorTree");
const Vec3 = require("vec3");
const { findBestInventoryItemByNames } = require("../../utils/inventory");

function getSolidAnchorBlock(bot, targetPos) {
  // candidate anchor blocks around target, with face vector from anchor -> target
  const candidates = [
    new Vec3(1, 0, 0),
    new Vec3(-1, 0, 0),
    new Vec3(0, 1, 0),
    new Vec3(0, -1, 0),
    new Vec3(0, 0, 1),
    new Vec3(0, 0, -1),
  ];

  for (const face of candidates) {
    const anchorPos = targetPos.minus(face);
    const anchorBlock = bot.blockAt(anchorPos);
    if (!anchorBlock) continue;

    // placeBlock requires a non-air reference block to click against
    if (anchorBlock.name !== "air") {
      return { anchorBlock, face };
    }
  }

  return null;
}

class PlaceCoverBlockNode extends Node {
  constructor(coverBlocksKeyOrNames = [ "andesite", "diorite", "granite", "cobblestone", "dirt"]) {
    super("PlaceCoverBlock");
    this.coverBlocksKeyOrNames = coverBlocksKeyOrNames;
  }

  async tick(bot, state, config) {
    const coverNames = Array.isArray(this.coverBlocksKeyOrNames)
      ? this.coverBlocksKeyOrNames
      : config?.BLOCKS?.[this.coverBlocksKeyOrNames]?.names || [];

    const baseX = Math.floor(bot.entity.position.x);
    const baseY = Math.floor(bot.entity.position.y);
    const baseZ = Math.floor(bot.entity.position.z);

    // Block above the bot's head while standing in a 1x1 pit
    const coverPos = new Vec3(baseX, baseY + 2, baseZ);
    const existing = bot.blockAt(coverPos);

    if (existing && existing.name !== "air") {
      return "SUCCESS";
    }

    const blockItem = findBestInventoryItemByNames(bot, coverNames, (item) => item.count);
    if (!blockItem) {
      bot.chat("No cover block in inventory.");
      return "FAILURE";
    }

    const anchor = getSolidAnchorBlock(bot, coverPos);
    if (!anchor) {
      bot.chat("No valid anchor to place cover block.");
      return "FAILURE";
    }

    try {
      await bot.equip(blockItem, "hand");
      await bot.placeBlock(anchor.anchorBlock, anchor.face);
    } catch (err) {
      console.error("PlaceCoverBlock error:", err);
      return "FAILURE";
    }

    const placed = bot.blockAt(coverPos);
    if (placed && placed.name !== "air") {
      return "SUCCESS";
    }

    return "FAILURE";
  }
}

module.exports = PlaceCoverBlockNode;
