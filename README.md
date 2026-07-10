# 🤖 DocuPilot: Universal AI-Agent Codebase Documenter

[![Snyk Security](https://img.shields.io/badge/Snyk-Safe-success.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Skills.sh](https://img.shields.io/badge/Registry-Skills.sh-orange.svg)](https://skills.sh)

**DocuPilot** (`documenting-code`) is a universal AI-Agent skill designed to scan any codebase, map its architecture, and compile a professional, publication-ready Microsoft Word (`.docx`) document and markdown summary. 

It is compatible with modern agentic platforms (like **Google Antigravity**, **Claude Code**, **Cursor**, **Cline**, and **Codex**).

---

## 🌟 Key Features

*   **📄 Native Word Formatting:** Compiles headers, bullet lists, bold text, and code syntax directly into Microsoft Word native styles. **Markdown tables are automatically parsed and rendered as native Word tables** (with borders and cell shading).
*   **🔒 Security-First & Offline Rendering:** Includes a local `@mermaid-js/mermaid-cli` compiler. Diagram code is rendered **100% offline** on your machine to prevent internal system architectures from leaking over the internet to public APIs.
*   **🤖 Universal Agent Support:** Integrates directly into your AI Agent's prompt guidelines via a single `SKILL.md` manifest.
*   **📊 Automatic Codebase Metrics:** Dynamically scans the target repository during compilation to log files discovered and files ignored.
*   **🧹 Zero Workspace Footprint:** Writes temporary worker sections into `.document-code-tmp/` and guarantees absolute folder cleanup even if the compilation fails.

---

## 📦 Installation

To install this skill locally inside your project workspace using the **Vercel Skills CLI**, run the following command in your terminal:

```bash
npx skills add https://github.com/guisiraST/documenting-code --skill documenting-code
```

This command clones the repository, copies the agent manifest into `.agents/skills/documenting-code/SKILL.md`, and prepares the local node compiler.

---

## 🚀 How to Run

1.  Open your AI coding agent (e.g., run `agy` or `claude` in your terminal).
2.  Command the agent to execute the skill:
    ```text
    Use the installed skill under .agents/skills/documenting-code to document this repository.
    ```
3.  **Setup Wizard:** The agent will ask you for:
    *   **Language:** Thai (`th`) or English (`en`).
    *   **Audience:** Developer Team (Deep Technical) or Client (High-Level Summary).
    *   **Writing Style:** Corporate, Educational, or Concise.
    *   **Sections:** Select from the 9-section master template.

4.  **Sit Back & Relax:** The agent will spawn subagents in parallel to analyze your code and generate the final document. Once done, you will find:
    *   `documentation.docx` (The final Microsoft Word document)
    *   `execution-summary.md` (A report containing execution metrics and screenshot checklists)

---

## 📖 The 9-Section Master Template

1.  **Overview & Executive Summary** — Business purpose, tech stack, and high-level architecture.
2.  **Architecture & Component Design** — Folder structure, design patterns, and components diagram.
3.  **Code Structure & Modules** — Crucial classes, main files, and logical entrypoints.
4.  **Database & Data Layer** — Relational database models, schemas, and schemas visual relationships.
5.  **API & Integration Specifications** — REST/GraphQL/gRPC endpoints, payloads, and call sequence diagrams.
6.  **Operational Workflows & Logic** — Business core workflow logic, loops, and condition flows.
7.  **Security & Compliance** — Authorization/Authentication middleware, sanitization, and data privacy.
8.  **Onboarding & Deployment Guide** — Local development setup steps, environment variables, and Docker.
9.  **Interactive Appendix & Screenshots** — Tagged list of screens requiring visual verification screenshots.

---

## 🔒 Security Policy & Offline Fallback

DocuPilot prioritizes data privacy. The compilation process attempts to render all Mermaid diagrams locally.
*   If `@mermaid-js/mermaid-cli` is installed, it runs locally in your workspace.
*   If it is not found, the compiler outputs a security warning in the terminal and falls back to rendering via `https://kroki.io` to ensure your build does not crash.

To guarantee 100% offline rendering, you can install the CLI globally:
```bash
npm install -g @mermaid-js/mermaid-cli
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
