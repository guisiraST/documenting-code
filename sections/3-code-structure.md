# Section 3: Code Structure & Modules

## Guidelines for AI Agent
* **Role:** Subagent B (Code & Logic Parser)
* **Goal:** Document the directory tree layout, module relationships, and major libraries/design patterns implemented.
* **Target Files to Analyze:** Full directory tree structure, packages definitions (package.json, Maven files, etc.), and file patterns.

## Output Template Structure
### 3.1 Repository Directory Structure
[Provide a clean directory layout tree of the repository, filtering out build assets and highlighting what folders represent what responsibilities.]
```
root/
├── src/                # Main application source code
│   ├── routes/         # Endpoint route configurations
│   └── controllers/    # Request handlers & logic
└── test/               # Automation test suites
```

### 3.2 Key Modules & Packages
[List the core directories/modules and detail their role inside the codebase.]
* **`/src/routes`**: Maps endpoint routes and registers middleware.
* **`/src/controllers`**: Implements core controller request-response cycles.

### 3.3 Design Patterns & Code Conventions
[Analyze if the code implements specific software design patterns, such as Singleton, Factory, Dependency Injection, Middleware chains, or Repository patterns, and explain how they are implemented.]
