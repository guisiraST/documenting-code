# document-code Orchestration Plan

This document outlines the orchestration workflow executed by the main AI Agent (e.g., Antigravity, Claude, or Codex) acting as the coordinator. It defines the system prompts, data flows, and constraints to partition codebase files and orchestrate specialized subagents.

---

## 1. Interaction & Parameters Interface
When a user runs the `documenting-code` skill, the AI Agent acts as the setup manager. It can either:
* **Interactive Mode:** Present terminal checklist prompt (using `prompts` or `inquirer` if run by human) to select:
  * `language`: `en`, `th`, or `both`.
  * `target_audience`: `client` (high-level executive summaries) or `dev_team` (detailed technical specifications).
  * `sections`: Select from the 9 master sections.
* **Direct Mode:** Accept parameters parsed directly from the agent tool invocation.

---

## 2. Directory Mapping & File Filtering
The Orchestrator maps the target directory to prevent sending irrelevant files to subagents:
1. **Directory Traversal:** Reads the folder structure recursively.
2. **Exclude Filter:** Completely skips build/dependency directories:
   * Directories: `node_modules`, `.git`, `.next`, `dist`, `build`, `.gemini`, `coverage`
   * Binary/Static assets: `.png`, `.jpg`, `.jpeg`, `.gif`, `.ico`, `.woff`, `.pdf`, `.zip`
3. **Context Index Construction:** Creates a tree representation of the codebase, counting total files and tracking file paths to provide a clean index for subagents.

---

## 3. Parallel Worker Dispatch & Dynamic Sections Guide Loading
To optimize context limits and keep subagents highly aligned with the output requirements, the Orchestrator uses a dynamic guide-loading pattern:

1. **User Section Selection:** The Orchestrator receives the list of user-selected sections (e.g., `[1, 2, 5, 9]`).
2. **Guide Reading:** For each selected section, the Orchestrator reads the corresponding section guide file: `sections/<id>-*.md` (e.g., `sections/1-overview.md`, `sections/5-api-specifications.md`).
3. **Context Injection:** The contents of these markdown guide files are injected directly into the subagent's prompting context, showing the worker exactly what to analyze and the required output format.
4. **Parallel Spawning:** The Orchestrator dispatches tasks parallelly via `invoke_subagent` mapping files and guide templates to each subagent:

| Worker Subagent | Codebase Target Files | Sections Guide Loaded | Output Scope |
|---|---|---|---|
| **Subagent A: System Architect** | Root config files (`package.json`, `tsconfig.json`, `Dockerfile`, etc.) | `sections/1-overview.md`<br>`sections/2-architecture.md` | **Section 1:** Overview & Executive Summary<br>**Section 2:** Architecture & Component Diagram |
| **Subagent B: Code & Logic Parser** | Main source directories (`/src`, `/lib`, `/app`, core logic files) | `sections/3-code-structure.md`<br>`sections/6-operational-workflows.md` | **Section 3:** Code Structure & Modules<br>**Section 6:** Operational Workflows & Logic Flows |
| **Subagent C: Data & API Specifier** | DB Schemas (`.prisma`, `/models`), API routes, controllers | `sections/4-database-schema.md`<br>`sections/5-api-specifications.md` | **Section 4:** Database & Data Layer<br>**Section 5:** API & Integration Specs |
| **Subagent D: DevOps & Security Auditor** | CI/CD scripts, test suites (`/tests`), security configs | `sections/7-security-compliance.md`<br>`sections/8-developer-onboarding.md` | **Section 7:** Security & Compliance<br>**Section 8:** Developer Onboarding & Deployment |
| **Subagent E: Visualizer & Tagger** | Frontend views (`/views`, `/components`, page routing) | `sections/9-interactive-appendix.md` | **Section 9:** Interactive Appendix & Screenshot Callouts |

---

## 4. State Aggregation & Translation Coordinator
Once all subagent tasks complete:
1. **Collector:** Gathers Markdown summaries and raw Mermaid.js text payloads from each worker.
2. **Translation Validator:** 
   * Checks language matching rules.
   * If `th` is selected, verifies that tech concepts are expressed with direct terms (e.g. keeping 'API', 'Database', 'Route' in English letters, rather than awkward transliterations) and formats the paragraphs smoothly.
3. **Payload Writer:** Creates a temporary JSON payload file in a standard schema structure:
   ```json
   {
     "language": "th",
     "target_audience": "dev_team",
     "target_path": "/Users/sira.h/sira_project/document-code",
     "document_title": "Project Documentation - document-code",
     "sections": [
       {
         "id": 1,
         "title": "System Overview",
         "content": "Markdown text summary...",
         "diagrams": [
           {
             "caption": "High Level Architecture",
             "mermaid_code": "graph TD\n  A[Client] --> B[Server]"
           }
         ],
         "screenshot_tags": [
           {
             "target_file": "src/index.js",
             "line_number": 42,
             "instruction": "Capture the interactive inquirer menu when run."
           }
         ]
       }
     ]
   }
   ```

---

## 5. Execution Command Handoff & Audit Trail
1. **Invokes Compiler CLI:** Executes:
   ```bash
   node src/index.js --payload /tmp/payload.json --output /path/to/project/documentation.docx
   ```
2. **Generates `execution-summary.md`:** Writes a process summary file recording:
   * Discovery stats (files read, folders ignored).
   * Spawning logs for each subagent (e.g. Subagent execution durations).
   * Mermaid diagrams generated and Kroki calls made.
   * Final status report (success/error, elapsed time, final output location).
