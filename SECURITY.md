# Security Policy

## Supported Versions

Currently, only the latest version of DineAI is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: | < 2.0.0 | :x:                |

## Reporting a Vulnerability

We take the security of DineAI seriously. If you believe you have found a security vulnerability, please report it to us as follows:

1.  **Do not open a public issue.**
2.  Send an email to the project maintainers (see GitHub profile) with a detailed description of the vulnerability.
3.  Include steps to reproduce, potential impact, and any suggested fixes.

We will acknowledge your report within 48 hours and provide a timeline for a fix. Please give us reasonable time to address the issue before making any information public.

## Security Practices

-   **API Keys**: Never commit your `GEMINI_API_KEY` or other secrets to the repository. Use `.env` files and ensure they are ignored by Git.
-   **Dependencies**: We regularly update dependencies to patch known vulnerabilities.
-   **Input Validation**: We use `Zod` for strict input validation to prevent common injection attacks.
