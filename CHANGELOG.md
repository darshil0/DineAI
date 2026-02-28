# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2026-02-28

### Changed

- **README Overhaul:** Completely rewritten `README.md` to include DineAI project name, comprehensive feature list from PRD, and verified technology stack (React, Tailwind, Express, Gemini 2.0 Flash).
- **Documentation:** Updated project documentation to reflect current architecture and capabilities.

### Fixed

- **Environment Support:** Updated `server.ts` to prioritize loading environment variables from `.env.local` as instructed in the README, while maintaining `.env` as a fallback.

## [1.2.1] - 2026-02-27

### Fixed

- Resolved TypeScript linting errors in `src/scripts/ingestRestaurants.ts` by updating property access to use `tags` instead of non-existent `ambiance` and `dietary_options`.
- Fixed runtime issues by updating model names to `gemini-2.0-flash` across all services and skills.
- Correctly implemented `@google/genai` (SDK 1.43.0) syntax for `generateContent`, ensuring `systemInstruction` and `contents` follow the required object/array structures.
- Fixed response parsing to correctly access `candidates[0].content.parts[0].text`.

### Changed

- Updated `PRD.md` to reflect the current state of the LLM backend (Gemini 2.0 Flash).
- Formatted the entire codebase using Prettier for consistency.
