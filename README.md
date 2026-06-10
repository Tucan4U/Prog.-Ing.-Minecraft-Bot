# Minecraft BT Bot with Mineflayer

An autonomous or semi-autonomous Minecraft bot built with Node.js and the Mineflayer framework.

The project combines behavior trees, combat AI, pathfinding, resource gathering, crafting automation, smelting system and multi-dimensional navigation into a modular intelligent agent capable of assisting players throughout Minecraft progression — from early-game survival to Ender Dragon preparation.

More detailed documentation is available in the Wiki:

https://github.com/Tucan4U/Prog.-Ing.-Minecraft-Bot/wiki

---

# Features

## AI & Behavior System

* Modular **Behavior Tree (BT)** architecture
* Autonomous decision-making system
* State task execution and interruption handling
* Dynamic target selection and action prioritization

---

## Combat System

### Melee Combat

* PvP combat using `mineflayer-pvp`
* Automatic target tracking
* Combat disengagement and recovery handling with `minefayer-auto-eat`

### Ranged Combat

* Bow combat using `minecrafthawkeye`
* Line-of-sight visibility checks
* Ammo and weapon validation
* Safe ranged engagement logic
* Cooldown-controlled attacks

---

## Navigation & Movement

* Intelligent pathfinding with `mineflayer-pathfinder`
* Multi-environment support:

  * Overworld
  * Nether
  * End
* Automatic obstacle avoidance
* Scaffold and tower movement handling
* Environment-aware movement safety

---

## Automation Systems

* Tree farming and log collection
* Automated mining and block gathering
* Animal hunting and food collection
* Crafting of simple tools
* Gold mining in the Nether dimension
* Piglin bartering automation
* Inventory management
* Equipment handling
* Blaze killing and blaze rod collection

---

## Chat Command Interface

The bot can be controlled directly through Minecraft chat commands.

Examples:

* Resource gathering
* Inventory checks
* Nether progression tasks
* Developer auxiliary commands

---

# Architecture Overview

The bot is built around a modular AI architecture consisting of:

## Core Systems

* **Behavior Tree Engine**
* **Task System**
* **Combat Manager**
* **Movement Manager**
* **Inventory Utilities**
* **Environment Detection**
* **Chat Command Parser**

---

## Behavior Tree Workflow

The bot continuously evaluates its state and executes behaviors based on priorities.

Example workflow:

```text
Player Command
      ↓
State Update
      ↓
Behavior Tree Tick
      ↓
Condition Checks
      ↓
Task Selection
      ↓
Action Execution
      ↓
World Feedback
      ↓
Repeat
```

---

## Combat Workflow

### Ranged Combat Flow

```text
Target Detection
      ↓
Distance Validation
      ↓
Line-of-Sight Check
      ↓
Weapon & Ammo Validation
      ↓
Aim Target
      ↓
Shoot
      ↓
Cooldown Handling
```

### Melee Combat Flow

```text
Target Detection
      ↓
Pathfinding
      ↓
Attack Range Check
      ↓
PvP Engagement
      ↓
Combat Monitoring
```

---

# Technologies & Libraries

## Core

* Node.js
* JavaScript (CommonJS)

## Mineflayer plugins and libraries

* `mineflayer`
* `mineflayer-pathfinder`
* `mineflayer-pvp`
* `mineflayer-collectblock`
* `minecrafthawkeye`
* `mineflayer-auto-eat`
* `mineflayer-tool`
* `mineflayer-utils`

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Tucan4U/Prog.-Ing.-Minecraft-Bot.git
cd Prog.-Ing.-Minecraft-Bot
```

---

## 2. Install Dependencies

```bash
npm install
```

---

# Configuration

Before running the bot, configure these inside 'index.js' file:

* Minecraft server host (We used "localhost")
* Port (We used 25565)
* Bot username

---

# Usage

In your Minecraft world (Make sure game's version is 1.21.11)

Start the bot with:

```bash
node index.js
```

---

# Available Commands

| Command              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `start`              | Starts the Behavior Tree main loop                   |
| `stop`               | Stops all current bot activities and resets state    |
| `profile overworld`  | Switches active AI profile to Overworld mode         |
| `profile hostile`    | Switches active AI profile to Hostile Combat mode    |
| `profile nether`     | Switches active AI profile to Nether mode            |
| `inventory`          | Prints the bot inventory to terminal                 |
| `entities`           | Displays nearby filtered entities for debugging      |
| `prep`               | Gives the bot Nether equipment (testing command)     |
| `nether`             | Starts the complete Nether progression workflow      |
| `enter nether`       | Navigates and enters the Nether portal               |
| `find fortress`      | Searches for a Nether fortress                       |
| `find blaze spawner` | Searches for a Blaze spawner inside fortress         |
| `collect rods x`     | Kills Blazes and collects `x` blaze rods             |
| `tp`                 | Teleports the bot to the player (operator/debug use) |

---

# Project Structure

```text
.
├── index.js
├── package.json
├── package-lock.json
├── physics.js
├── config.js
├── state.js
├── behaviors/
├── bt/ 
│   ├── behaviorTree.js
│   ├── decorators/
│   ├── nodes/
│   ├── profiles/
│   ├── scores/
│   ├── selectors/
├── utils/
├── commands/ 
├── sensors/
├── test/
├── utils/
├── docs/
```

---

# Documentation

Additional and detailed project documentation is available in the GitHub Wiki, including:

* Archtecture Overview
* Bot Functionalities
* Code Profiling Report
* Development Workflow
* Installation and Usage
* Object-Oriented Metrics 
* System Design
* WBS and PERT diagrams
* Software Architectural Patterns

GitHub Wiki:

https://github.com/Tucan4U/Prog.-Ing.-Minecraft-Bot/wiki

---

# Development Goals

The long-term goal of the project is to create a fully autonomous Minecraft assistant capable of:

* Surviving independently
* Progressing through the game
* Gathering resources intelligently
* Fighting hostile entities
* Navigating all dimensions
* Assisting players dynamically

---

# Future Improvements

Planned improvements include:

* Full survival progression AI
* Better combat prediction
* Individualization of tasks
