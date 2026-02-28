# DineAI Product Requirements Document (PRD) v1.3 - Node/Gemini Edition

**Date:** February 2026

## Executive Summary

**DineAI** is an AI-powered restaurant recommendation chatbot that orchestrates multiple specialized agents to deliver personalized, real-time dining suggestions. By combining Retrieval-Augmented Generation (RAG) with Google Gemini embeddings, multimodal vision analysis, and live web search, DineAI builds dynamic user taste profiles that account for personal preferences, budgets, and dining styles—going beyond static filters or one-size-fits-all recommendations.

The system leverages a custom **Express/Node.js** agent orchestrator with a modular **Agent Skills** architecture, an in-memory vector database for semantic retrieval, **Gemini Structured Outputs** for validation, and a **React/Tailwind** web interface for user interaction—resulting in a production-grade AI pipeline that is both extensible and explainable.

## Problem Statement

Choosing where to eat is a deceptively complex decision. Existing solutions fall short in several key ways:

- **Static filtering tools** (e.g., Yelp, Google Maps) rely on basic filters like rating or cuisine and cannot reason about nuanced personal taste, dining occasions, or emerging food trends.
- **Traditional recommendation systems** depend on collaborative filtering, which suffers from cold-start issues and cannot incorporate multimodal inputs such as dining photos.
- **No current consumer product** integrates real-time food trend data with personalized historical preference analysis in a conversational interface.

**DineAI** addresses all three gaps through a collaborative multi-agent architecture that learns, retrieves, searches, and reasons in a unified pipeline.

## Goals & Success Metrics

### Primary Goals

- Deliver a working end-to-end multi-agent RAG pipeline for restaurant recommendation.
- Implement a modular **Agent Skills** architecture for composable agent capabilities.
- Integrate multimodal LLM analysis for user-provided dining photos.
- Surface real-time food trend data via Google Search grounding.
- Expose the system through an interactive React chatbot interface with strictly typed UI components.

### Success Metrics

| Metric                   | Target             | Measurement Method                            |
| ------------------------ | ------------------ | --------------------------------------------- |
| Retrieval Precision@5    | ≥ 70%              | Manual relevance evaluation on test queries   |
| Recommendation Relevance | ≥ 4.0 / 5.0        | User ratings in React app                     |
| End-to-end Latency       | < 15 seconds (P95) | Timed pipeline runs                           |
| Agent Output Validity    | 100%               | Gemini Structured Output validation pass rate |

## System Architecture

DineAI comprises four coordinated layers that can operate sequentially or in parallel:

| Layer               | Component                    | Technology                                                   |
| ------------------- | ---------------------------- | ------------------------------------------------------------ |
| Data Ingestion      | Restaurant knowledge base    | Local in-memory Vector DB (`vectorDb.ts`)                    |
| Agent Orchestration | Multi-agent coordination     | Express.js custom orchestrator                               |
| Agent Capabilities  | Modular Agent Skills         | Composable TypeScript functions (`/src/skills`)              |
| Retrieval           | Semantic similarity search   | Gemini Embeddings (`text-embedding-004`) + Dot Product Search |
| Trend Analysis      | Real-time web search         | Gemini Google Search Tool                                    |
| Vision Analysis     | Dining photo interpretation  | Gemini Multimodal (`analyzeFoodPhoto` skill)                 |
| Output Validation   | Structured agent responses   | Gemini `responseSchema`                                      |
| User Interface      | Conversational chatbot       | React + Tailwind CSS (`ChatMessage`, `RecommendationCard`)   |
| LLM Backend         | Agent reasoning & generation | Google Gemini API (`@google/genai`) - Gemini 2.0 Flash       |
| Observability       | Structured Logging           | Custom Logger (`src/lib/logger.ts`)                          |

## Agent Design

All agents are defined via centralized system instructions (`/src/prompts/index.ts`) and communicate through a shared Express route handler. Agents utilize a registry of **Agent Skills** to perform specific tasks.

### 1. Profile Builder Agent

**Responsibility:** Build a structured user taste profile using past restaurant visits, written reviews, and optional dining photos. The profile includes preferred cuisines, price sensitivity, ambiance preferences, and dietary restrictions.

- **Skills Used:** `extractCuisines`, `analyzeFoodPhoto` (run in parallel)
- **Output Schema:** `UserTasteProfile` — cuisines[], price_range, ambiance[], dietary_notes, special_occasions[]

### 2. RAG Recommender Agent

**Responsibility:** Query the restaurant database using the `UserTasteProfile` to retrieve the top-K candidate restaurants most aligned with user preferences using a hybrid search approach.

- **Skills Used:** `generateEmbedding` (semantic recall), `scoreRestaurant` (rule-based precision re-ranking)
- **Output Schema:** `CandidateList` — List[Restaurant] with `match_score` and `embedding_score`

### 3. Food Trend Analyst Agent

**Responsibility:** Retrieve current trending cuisines, newly opened restaurants, and viral dining experiences in the user’s city. Enhance candidate suggestions with trend context.

- **Tools:** Gemini Google Search Tool
- **Output Schema:** Unstructured text report (TrendReport)

### 4. Recommendation Finalizer Agent

**Responsibility:** Combine data from the `UserTasteProfile`, `CandidateList`, and `TrendReport` to produce a ranked set of restaurant recommendations, each with natural-language rationale.

- **Tools:** LLM reasoning (no external tools)
- **Output Schema:** `FinalRecommendations` — List[Recommendation] with rank, name, rationale, match_score, trend_relevance

## Data Requirements

### Restaurant Knowledge Base

- Minimum 100 restaurant records for MVP.
- Each record includes: name, cuisine type, price tier ($, $$, $$$, $$$$), neighborhood, average rating, description, and tags (ambiance, dietary options, occasion suitability).
- Records are embedded and stored in the Vector DB on server startup.

### User Input Data

- **Text:** Written preference statements, past restaurant reviews, and conversational inputs.
- **Images (optional):** Dining photos processed by the Vision LLM for cues such as cuisine type, plating style, and dining ambiance.

## Functional Requirements

| ID    | Requirement                                                                                   | Priority |
| ----- | --------------------------------------------------------------------------------------------- | -------- |
| FR-01 | System shall validate and sanitize all chat inputs server-side using `zod`.                   | P0       |
| FR-02 | Profile Builder Agent shall produce a valid `UserTasteProfile` using modular skills.          | P0       |
| FR-03 | RAG Agent shall return top candidates using semantic search and explicit scoring.             | P0       |
| FR-04 | Food Trend Agent shall return trending items per query using Google Search.                   | P0       |
| FR-05 | All agent outputs shall pass Gemini Schema validation before being passed downstream.         | P0       |
| FR-06 | Recommendation Finalizer shall produce a ranked list (3–5 restaurants) with rationales.       | P0       |
| FR-07 | System shall support optional dining photo input analyzed by the Vision LLM.                  | P1       |
| FR-08 | React interface shall display match scores and trend relevance badges using typed components. | P1       |
| FR-09 | System shall support multi-turn conversations for preference refinement.                      | P2       |
| FR-10 | System shall log all agent interactions for debugging and evaluation.                         | P2       |

## Technology Stack

| Category            | Technology                  | Version / Notes                             |
| ------------------- | --------------------------- | ------------------------------------------- |
| Agent Framework     | Custom Express Orchestrator | Node.js with Agent Skills Registry          |
| LLM (Text & Vision) | Google Gemini API           | `@google/genai` SDK v1.43.0                 |
| Embeddings          | Gemini `text-embedding-004` | Used for semantic search                    |
| Vector DB           | Custom In-Memory DB         | Pre-normalized embeddings, dot product      |
| Web Search          | Gemini Google Search Tool   | Built-in tool                               |
| Output Validation   | Gemini `responseSchema`     | Type.OBJECT, Type.ARRAY                     |
| UI                  | React + Tailwind CSS        | Vite build system v7.3.1                    |
| Backend             | Express.js                  | v5.2.1 with async error handling            |
| Language            | TypeScript                  | Strict mode v5.8.3                          |
| Observability       | Structured Logging          | Custom Logger (`src/lib/logger.ts`)         |

## Risks & Mitigations

| Risks & Mitigations | Likelihood | Impact | Mitigation                                              |
| ------------------- | ---------- | ------ | ------------------------------------------------------- |
| Gemini API quota limits  | Medium     | High   | Implement exponential backoff retries for embeddings    |
| Vector DB failure        | Low        | High   | Fallback to static JSON filtering via LLM               |
| Search tool failures     | Low        | Medium | Catch errors and continue pipeline without trend data   |
| Low Vision LLM relevance | Medium     | Low    | Make photo upload optional                              |
| JSON parsing errors      | Medium     | High   | Use robust `cleanJson` helper and schema validation     |
| Partial ingestion loss   | Medium     | Medium | Collective upsert only on partial success in ingestion  |
