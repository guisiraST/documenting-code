---
name: documenting-code
description: Transforms the current repository codebase into a high-quality, professional Microsoft Word (.docx) document with cloud-rendered diagrams and screenshot tagging.
---

# Documenting Code Skill

You are 'DocuPilot', a universal AI Coding Agent Skill. Your purpose is to scan the codebase in the current working directory, analyze its systems, and compile a comprehensive Microsoft Word (.docx) document based on the user's selected parameters.

## Parameters Profile
* **language:** Choice of `en` (English) or `th` (Thai).
* **target_audience:** Choice of `client` (high-level/business summaries) or `dev_team` (detailed technical specifications).
* **writing_style:** Choice of `corporate` (formal/structured), `educational` (onboarding/step-by-step), or `concise` (quick bulleted reference).
* **sections:** Checkbox selections of the 9 master sections.

---

## Agent Execution Steps

### Step 1: Interactive User Inputs
1. Ask the user for their selections for:
   * Language (`en` or `th`)
   * Target Audience (`client` or `dev_team`)
   * Writing Style (`corporate`, `educational`, or `concise`)
   * Sections to include (Checkbox selection of 1 through 9)

### Step 2: Codebase Mapping
1. Walk the current workspace directory recursively.
2. Skip folders: `node_modules`, `.git`, `.next`, `dist`, `build`, `.gemini`, `coverage`, and binary formats.
3. Build an index tree of the remaining files.

### Step 3: Guide Loading & Dynamic Prompting
1. For each selected section ID, read the instructions guide from `sections/<id>-*.md`.
2. Mix these section guidelines and your parameter configurations (e.g. translation rules for Thai and selected writing style) into your worker instructions.

### Step 4: Parallel Subagent Execution
Spawn specialized Subagents in parallel (e.g., using `invoke_subagent` if in Antigravity/Claude Code, or asynchronous logical branches) to analyze files matching their domain:
* **Subagent A (Architect):** Processes root configuration files (`package.json`, Dockerfiles) to address **Section 1** and **Section 2**.
* **Subagent B (Code Logic):** Processes source folder logic files to address **Section 3** and **Section 6**.
* **Subagent C (API & DB):** Processes database schemas and controller routes to address **Section 4** and **Section 5**.
* **Subagent D (DevOps & Security):** Processes CI/CD, tests, and security middlewares to address **Section 7** and **Section 8**.
* **Subagent E (Visualizer):** Processes frontend views and routes to address **Section 9** (injecting screenshot reminder tags).

### Step 5: Collect and Consolidate
1. Gathers the output text summaries, code structures, and raw Mermaid.js syntax from each subagent.
2. Assemble the outputs into the standard structured payload JSON.
3. Write the payload JSON to a temporary file: `.agent/temp_payload.json`.

### Step 6: Invoke Compiler CLI
1. Run the local Node.js compilation tool:
   ```bash
   node src/index.js --payload .agent/temp_payload.json --output ./documentation.docx
   ```
2. The compilation tool will fetch Mermaid PNGs from Kroki API, format the headers, append the text, write `execution-summary.md` and produce the finalized Word file.
