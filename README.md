<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# DineAI

**DineAI** is an AI-powered restaurant recommendation chatbot that orchestrates multiple specialized agents to deliver personalized, real-time dining suggestions. By combining Retrieval-Augmented Generation (RAG) with Google Gemini embeddings, multimodal vision analysis, and live web search, DineAI builds dynamic user taste profiles that account for personal preferences, budgets, and dining styles.

View your app in AI Studio: https://ai.studio/apps/6991651b-a322-44dd-b708-0413e783338e

## Features

- **Profile Builder Agent:** Builds a structured user taste profile using past restaurant visits, written reviews, and optional dining photos.
- **RAG Recommender Agent:** Queries the restaurant database using semantic similarity search to retrieve the top candidate restaurants.
- **Food Trend Analyst Agent:** Retrieves current trending cuisines and newly opened restaurants using Google Search grounding.
- **Recommendation Finalizer Agent:** Produces a ranked set of restaurant recommendations with natural-language rationale.
- **Multimodal Vision Analysis:** Analyze user-provided dining photos to understand preferences.
- **Interactive Chat Interface:** A React/Tailwind-based chatbot for seamless interaction.

## Technology Stack

- **Frontend:** React, Tailwind CSS, Lucide React, Motion
- **Backend:** Node.js, Express
- **AI/LLM:** Google Gemini API (`@google/genai` SDK v1.43.0)
- **Model:** `gemini-2.0-flash`
- **Embeddings:** `text-embedding-004`
- **Vector Database:** Custom In-Memory Vector DB
- **Development Tools:** Vite, TypeScript, Prettier, ESLint

## Run Locally

**Prerequisites:** Node.js (v18+)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```
   Then open `.env.local` and set `GEMINI_API_KEY` to your Gemini API key.

3. **Run the app:**
   ```bash
   npm run dev
   ```

## Architecture

The system leverages a custom Express/Node.js agent orchestrator with a modular Agent Skills architecture. It uses an in-memory vector database for semantic retrieval, Gemini Structured Outputs for validation, and a React/Tailwind web interface for user interaction.

## Notes

- **AI SDK & Model:** This project is optimized for the `@google/genai` (SDK 1.43.0+) using the `gemini-2.0-flash` model. Request and response structures are standardized for this version pairing.
- **Environment:** The server loads environment variables from `.env.local` first, falling back to `.env`.
- **Vector DB:** The Vector DB is an in-memory implementation. Restarting the server will clear its state.
