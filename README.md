# Minecraft Bot with Mineflayer

A Node.js-based Minecraft bot built using the Mineflayer framework.
This bot can connect to a Minecraft server and perform automated tasks such as navigation, resource collection, and executing commands via in-game chat.

---

## Features

* Pathfinding and navigation
* Automated collection of certain blocks
* Hunting
* Piglin bartering automation
* Chat-based command system
* Multi-environment support (Overworld / Nether / End)

---

## Documentation

Detailed documentation, including system design, Work Breakdown Structure (WBS), and PERT diagrams, is available in the Wiki:

https://github.com/Tucan4U/Prog.-Ing.-Minecraft-Bot/wiki

---

## Technologies and libraries used

* Node.js
* Mineflayer
* mineflayer-pathfinder
* mineflayer-collectblock

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Tucan4U/Prog.-Ing.-Minecraft-Bot.git
cd Prog.-Ing.-Minecraft-Bot
```

### 2. Install dependencies

```bash
npm install
```

---

## Usage

In your Minecraft world 

Start the bot with:

```bash
node main.js
```

Before running, make sure to configure:

* Minecraft server port (We used 25565)
* Bot username
* Any other required settings in `main.js`

---

## Available Commands

The bot responds to in-game chat commands:

| Command          | Description                      |
| ---------------- | -------------------------------- |
| `hi`             | Greets the player                |
| `stop`           | Stops the current task           |
| `come here`      | Teleports the bot to the player  |
| `start hunting`  | Starts hunting animals and collects food|
| `enter nether`   | Navigates to the Nether          |
| `find fortress`  | Searches for a Nether fortress   |
| `get gold nether`| Mines gold in Nether             |
| `barter`         | Performs piglin bartering        |

---

## Project Structure

```
.
├── main.js
├── package.json
├── package-lock.json
└── docs/
```
In the `docs/` folder are located the WBS and PERT diagrams.

---

## Dependencies

Main libraries used:

* `mineflayer` – Core bot framework
* `mineflayer-pathfinder` – Navigation and movement
* `mineflayer-collectblock` – Block collection automation

---

## Overview

The bot is meant to assist the player in his quest to kill the Ender Dragon.
It listens for chat commands and executes actions accordingly.
It uses pathfinding algorithms to navigate the Minecraft world and interact with entities and blocks.

---
