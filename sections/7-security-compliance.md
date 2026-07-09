# Section 7: Security & Compliance

## Guidelines for AI Agent
* **Role:** Subagent D (DevOps & Security Auditor)
* **Goal:** Audit the codebase for security controls, cryptography configurations, vulnerability prevention, and compliance.
* **Target Files to Analyze:** Security middlewares, rate-limiters, input sanitizers, package versions, and credentials configurations.

## Output Template Structure
### 7.1 Data Encryption Standards
[Describe how data is secured: encryption-at-rest (database encryption, file store encryption) and encryption-in-transit (SSL/TLS protocols).]

### 7.2 Core Security Implementations
[State how the codebase handles common security challenges: input validation, cross-site scripting (XSS) prevention, SQL Injection avoidance, and CORS configurations.]

### 7.3 Credentials & Secret Management
[Review how private credentials (API keys, DB connection strings, JWT passwords) are loaded (e.g. env files) and verify that no secret keys are hardcoded in the codebase.]
