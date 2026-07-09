# document-code Subagent Design Plan

This document defines the specialized Subagent worker definitions, prompts, and analytical targets required to analyze sections of the codebase concurrently.

---

## 1. Subagent A: System Architect (Structure & Infrastructure)
* **Goal:** Understand high-level modular dependencies and infrastructure configurations.
* **Analysis Target Files:**
  * Project configurations: `package.json`, `tsconfig.json`, `pom.xml`, `build.gradle`, `requirements.txt`, `Cargo.toml`.
  * Infrastructure configs: `Dockerfile`, `docker-compose.yml`, `.env.example`, `nginx.conf`, server setup scripts.
* **Duties:**
  * Draft the High-Level Tech Stack details (runtime version, core frameworks, utilities).
  * Generate a architectural layout describing component interaction.
* **Mermaid Output:** A structural layout diagram representing component dependencies.
* **Prompt Template:**
  ```markdown
  Analyze these configuration and environment files of the repository:
  {{files}}

  Generate:
  1. An executive summary describing the overall tech stack, frameworks used, and system setup.
  2. A Mermaid.js flow diagram representing the modular architecture (e.g. Client -> Web server -> DB).
  ```

---

## 2. Subagent B: Code & Logic Parser (Core Flow Analyst)
* **Goal:** Extract application flow, module definitions, and primary classes.
* **Analysis Target Files:**
  * Source code: files in `/src`, `/lib`, `/app` that implement core business rules, service controllers, or background logic.
* **Duties:**
  * Map how inputs move through the application.
  * Summarize critical files and classes.
* **Mermaid Output:** Workflow/Process sequence chart for major use cases.
* **Prompt Template:**
  ```markdown
  Analyze these core source files:
  {{files}}

  Summarize:
  1. The core logic blocks and how modules import/interact with each other.
  2. A Mermaid.js flowchart showing the main logic execution path.
  ```

---

## 3. Subagent C: Data & API Specifier (Data Model & REST API Specialist)
* **Goal:** Map the data models, database configurations, and external API interfaces.
* **Analysis Target Files:**
  * Schema & database files: `.prisma`, `/models/*.js`, `/migrations/*.sql`, Mongoose/Sequelize models.
  * API route handlers: `/routes/*.js`, `/controllers/*.js`, controller functions, endpoints declarations.
* **Duties:**
  * Tabulate endpoints: Method, Endpoint Path, Parameter Payload, Response format, Authentication rules.
  * Document database tables/collections, indices, and relationships.
* **Mermaid Output:** Entity-Relationship (ER) diagram or API endpoint call trace.
* **Prompt Template:**
  ```markdown
  Analyze these database schema and API route files:
  {{files}}

  Generate:
  1. A markdown table of all API endpoints detailing method, path, input arguments, and expected response.
  2. Database structures (tables, columns, fields, data-types).
  3. A Mermaid.js ER diagram or API call sequence diagram.
  ```

---

## 4. Subagent D: DevOps & Security Auditor (Quality, Security & Deployments)
* **Goal:** Review testing infrastructure, pipeline configurations, and security protocols.
* **Analysis Target Files:**
  * CI/CD files: `.github/workflows/*.yml`, `.gitlab-ci.yml`.
  * Testing configs: `vitest.config.ts`, `jest.config.js`, test setup files.
  * Security helpers: Auth Middlewares, CORS settings, input sanitization configs.
* **Duties:**
  * Step-by-step onboarding guide to run and configure the workspace locally.
  * Security review (authentication mechanisms, vulnerability preventions).
  * Testing overview (how to execute unit/integration tests).
* **Prompt Template:**
  ```markdown
  Analyze these security, testing, and deployment files:
  {{files}}

  Formulate:
  1. A local setup and environment configuration guide.
  2. Detailed instructions on running test suites.
  3. Security findings (e.g. how CORS/JWT is structured in the code).
  ```

---

## 5. Subagent E: Visualizer & Tagger (Visual Context Selector)
* **Goal:** Locate UI routes and components to place screenshot reminders for developers.
* **Analysis Target Files:**
  * Frontend components: `/components/*.jsx`, `/views/*.ejs`, `/pages/*.tsx`, HTML layouts, routing tables.
* **Duties:**
  * Scan for visual components (buttons, grids, modals) and route definitions.
  * Format clear instructions: `[📸 DEV SCREENSHOT REQUIRED: Capture the visual state of the <Component/RouteName> located in <FilePath>:<LineNumber>]`.
* **Prompt Template:**
  ```markdown
  Analyze these frontend views and page routing declarations:
  {{files}}

  Find any major UI components or routes and generate screenshot reminder tags following this exact format:
  [📸 DEV SCREENSHOT REQUIRED: Capture the visual state of the <Component/RouteName> located in <FilePath>:<LineNumber>]
  ```
