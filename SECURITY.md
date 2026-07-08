# Security Policy

## Supported Versions

Currently, only the latest version of DineAI is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 2.0.0 | :x:                |

## Reporting a Vulnerability

We take the security of DineAI seriously. If you believe you have found a security vulnerability, please report it to us as follows:

1.  **Do not open a public issue.**
2.  Send an email to the project maintainers (see GitHub profile) with a detailed description of the vulnerability.
3.  Include steps to reproduce, potential impact, and any suggested fixes.

We will acknowledge your report within 48 hours and provide a timeline for a fix. Please give us reasonable time to address the issue before making any information public.

## Security Practices

-   **API Keys**: Never commit your `GEMINI_API_KEY` or other secrets to the repository. Use `.env` files and ensure they are ignored by Git.
-   **Dependencies**: We regularly update dependencies to patch known vulnerabilities.
-   **Input Validation**: We use `Zod` for strict input validation of all incoming payloads to prevent common injection attacks.
-   **Origin Restriction**: Strict Cross-Origin Resource Sharing (CORS) policies are enforced at the server level, restricting API access to trusted localhost origins.
-   **File Uploads**: Image uploads are capped at 5MB and strictly validated for allowed MIME types (JPEG, PNG, WEBP, GIF) to prevent malicious file execution.
-   **Conversation Privacy**: Chat history is truncated to the last 10 exchanges to minimize PII persistence and limit context window exposure.
