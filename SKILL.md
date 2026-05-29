# Skill: Furnace Agent — SKILL.md (agent-customization)

Purpose
- Provide a reusable, workspace-scoped skill that documents the furnace/cooking/smelting workflow, decision logic, and quality checks for the project's furnace-related behavior-tree nodes.

When to use
- Use when adding or modifying furnace behaviors, loaders, or helpers in the `bt/nodes` or `behaviors` folders.

Inputs
- Conversation history or PR describing the change.
- Files touched: behavior nodes, `utils/inventory.js`, and `state.js`.

Outputs
- A concise checklist and step-by-step workflow for implementing or reviewing furnace features.
- Example prompts and templates for automated edits.

Step-by-step process
1. Discover: locate existing furnace nodes (`loadFurnaceNode.js`, `waitFurnaceNode.js`, `prepareFurnaceMaterialsNode.js`).
2. Gather: determine required items (fuel + input materials) using `utils/inventory.js` sensors.
3. Move: select movement and placement nodes to reach furnace blocks.
4. Load: interact with furnace UI and place inputs/fuel.
5. Wait/Monitor: use `waitFurnaceNode` to poll progress and handle interruptions.
6. Collect & Cleanup: pick up results, free slots, and reset workflow.

Decision points
- When to prioritize fuel over input materials (low fuel reserve vs abundant raw materials).
- Whether to smelt stacked inputs in one furnace or distribute across multiple furnaces.
- Retry/backoff strategy for transient UI failures.

Quality criteria / completion checks
- Furnace workflow must not drop items on ground unexpectedly.
- Items consumed and produced counted correctly in `state.js` and `utils/inventory.js`.
- Workflow recovers from partial failures (e.g., furnace destroyed or player moved).
- Minimal blocking of other behaviors (use selectors to yield appropriately).

Ambiguities to clarify
- Preferred fuel types and configuration overrides (config.js?).
- Target furnace selection policy when multiple furnaces nearby.
- Whether to persist counts in `state.js` or compute on-demand.

Examples / Prompts to use
- "Update furnace workflow to prefer coal over planks when coal < 16" — starting prompt.
- "Add retry/backoff to `waitFurnaceNode` for intermittent GUI failures" — starting prompt.

Iteration guidance
1. Draft node change.
2. Run narrow unit/smoke tests (simulate inventory changes).
3. Manually test in-game if possible.
4. Iterate based on observed failure modes.

Coding & commenting guideline
- Add short, descriptive comments to every new or edited function describing intent and important invariants (2–3 words header + one concise sentence). Example:

  // Purpose: ensure furnace has fuel before loading
  // Invariant: leaves at least 1 fuel item in reserve
  function ensureFuel() { ... }

- Prefer clear variable names over comments, but include a one-line comment when a non-obvious decision is encoded.

Files to update checklist
- bt/nodes/loadFurnaceNode.js
- bt/nodes/waitFurnaceNode.js
- bt/nodes/prepareFurnaceMaterialsNode.js
- utils/inventory.js
- state.js

Next steps
- Review the ambiguous items above and tell me preferred choices (fuel preference, furnace selection policy, persistence choice).
- I can then update `SKILL.md` or implement the changes in the codebase.

---

(Comments: This SKILL.md is workspace-scoped and written to be concise; it instructs contributors to include short, descriptive comments in code according to coding principles.)