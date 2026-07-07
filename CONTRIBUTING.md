# Contributing to DineAI 🍽️

Thank you for your interest in contributing to DineAI! We welcome contributions from the community to help make DineAI the best AI-powered restaurant recommender.

## 🛣️ Contribution Workflow

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/DineAI.git
    cd DineAI
    ```
3.  **Create a new branch** for your feature or bugfix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
4.  **Make your changes** and ensure they follow our coding standards.
5.  **Run tests and linting** (see below).
6.  **Commit your changes** with a descriptive commit message.
7.  **Push to your fork** and **submit a Pull Request**.

## 💻 Coding Standards

-   **TypeScript**: Use TypeScript for all new code. Ensure your code passes `npm run lint`.
- **ESM Modules**: We use ESM. All internal imports must include the `.js` extension (e.g., `import { x } from './utils.js'`).
-   **Modular Agent Skills**: If adding new AI capabilities, follow the `AgentSkill` interface defined in `SKILLS.md`.
-   **Resilience**: Wrap all Gemini API calls in the `withRetry` utility from `src/lib/utils.ts`.
-   **Error Handling**: Use the custom error classes from `src/lib/errors.ts` (`AppError`, `SkillError`, etc.).
-   **Formatting**: We use Prettier for code formatting. Run `npx prettier --write .` before committing.
-   **Documentation**: Update `CHANGELOG.md` for any notable changes and keep architecture docs (`AGENTS.md`, `DESIGN.md`, `SKILLS.md`) in sync.

## 🧪 Testing & Verification

Before submitting a PR, please ensure all tests pass:

```bash
# Run unit tests for core libraries and skills
npm run test

# Run the full system verification script
npm run verify

# Run type checking
npm run lint
```

## 🧪 Adding a New Skill

To add a new capability to DineAI:

1.  **Define Types**: Add input/output interfaces in `src/skills/[skillName].ts`.
2.  **Implement Logic**: Create the skill object implementing `AgentSkill<I, O>`.
3.  **Register Skill**: Add the skill to `src/skills/bootstrap.ts` to make it available to agents.
4.  **Write Tests**: Add unit tests in `src/skills/__tests__/[skillName].test.ts`.

## 🤖 Agent-Specific Guidelines

If you are working on the agent orchestration or specific skills, please refer to:
-   `AGENTS.md`: For overall agent architecture and reliability standards.
-   `SKILLS.md`: For technical specifications of individual skills.

## 💾 Working with Vector DB

- **Ingestion**: The `src/scripts/ingestRestaurants.ts` script handles batch embedding.
- **Deduplication**: We use a `name-neighborhood` slug for deduplication.
- **Persistence**: The index is saved to `vector_index.json` on shutdown.

## 📝 Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub. Provide as much detail as possible, including steps to reproduce the bug.

---

By contributing to DineAI, you agree that your contributions will be licensed under the project's MIT License.
