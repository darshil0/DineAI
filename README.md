# DineAI 🍽️

**DineAI** is an AI-powered restaurant recommendation chatbot that orchestrates multiple specialized agents to deliver personalized, real-time dining suggestions. By combining Retrieval-Augmented Generation (RAG) with Google Gemini embeddings, multimodal vision analysis, and live web search, DineAI builds dynamic user taste profiles that account for personal preferences, budgets, and dining styles—going beyond static filters or one-size-fits-all recommendations.

The system leverages a custom **Express/Node.js** agent orchestrator with a modular **Agent Skills** architecture, an in-memory vector database for semantic retrieval, **Gemini Structured Outputs** for validation, and a **React/Tailwind** web interface for user interaction—resulting in a production-grade AI pipeline that is both extensible and explainable.

## 🚀 Key Features

- **Multi-Agent Orchestration**: A specialized pipeline of agents (Profile Builder, RAG Recommender, Trend Analyst, and Finalizer) working together.
- **Dynamic Taste Profiles**: Automatically infers your preferences from chat history and uploaded food photos.
- **Neighborhood-Aware Recommendations**: Specify your preferred areas (e.g., "West Village", "SoHo") to get hyper-local suggestions.
- **Real-Time Trend Analysis**: Integrates live Google Search data to find trending cuisines, new openings, and viral dishes.
- **Semantic Search (RAG)**: Uses Gemini embeddings and a vector database for high-precision restaurant retrieval.
- **Explainable AI**: Every recommendation comes with a personalized rationale explaining exactly why it fits your taste.

## 🛠️ Technology Stack

| Category | Technology | Version / Notes |
|-----------|-------------|----------------|
| Frontend | React + Tailwind CSS | Vite build system, Lucide Icons |
| Backend | Node.js + Express | Custom Agent Orchestrator |
| AI/LLM | Google Gemini API | `@google/genai` SDK |
| Models | `gemini-3-flash-preview` | Text & Vision analysis |
| Reasoning | `gemini-3.1-pro-preview` | Complex agent reasoning |
| Embeddings | `gemini-embedding-2-preview` | Used for semantic search |
| Vector DB | Custom In-Memory DB | Local semantic storage |
| Web Search | Gemini Google Search Tool | Real-time trend retrieval |

## 🏗️ System Architecture

DineAI comprises four coordinated layers that can operate sequentially or in parallel:

| Layer | Component | Technology |
|--------|------------|------------|
| Data Ingestion | Restaurant knowledge base | Local in-memory Vector DB (`vectorDb.ts`) |
| Agent Orchestration | Multi-agent coordination | Express.js custom orchestrator |
| Agent Capabilities | Modular Agent Skills | Composable TypeScript functions (`/src/skills`) |
| Retrieval | Semantic similarity search | Gemini Embeddings + Cosine Similarity |
| Trend Analysis | Real-time web search | Gemini Google Search Tool |
| Vision Analysis | Dining photo interpretation | Gemini Multimodal (`analyzeFoodPhoto` skill) |
| Output Validation | Structured agent responses | Gemini `responseSchema` |
| User Interface | Conversational chatbot | React + Tailwind CSS |

### Agent Design

1. **Profile Builder Agent**: Analyzes messages and photos to create a `UserTasteProfile`.
2. **RAG Recommender Agent**: Performs semantic search and rule-based re-ranking to find candidate restaurants.
3. **Food Trend Analyst Agent**: Searches the web for local food trends and classifies their relevance to your profile.
4. **Recommendation Finalizer Agent**: Synthesizes all data into a friendly, ranked list of recommendations.

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- A Google Gemini API Key

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in a `.env` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📊 Success Metrics
| Metric | Target |
|--------|---------|
| Retrieval Precision@5 | ≥ 70% |
| Recommendation Relevance | ≥ 4.0 / 5.0 |
| End-to-end Latency | < 15 seconds (P95) |
| Agent Output Validity | 100% |

## 📄 License
MIT
