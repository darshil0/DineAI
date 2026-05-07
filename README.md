# DineAI 🍽️

DineAI is an AI-powered restaurant recommendation engine where users chat naturally about their dining preferences and receive intelligent suggestions based on their taste profile. The system learns from natural conversation, uploaded food photos, and contextual filters such as location, cuisine, price point, and dietary restrictions. It integrates live web search to identify trending spots and new openings, backed by a vector database for semantic preference matching.

The frontend offers a clean React interface with chat persistence, photo upload, and skeleton loading states. The backend orchestrates specialized Gemini-powered agents for profile building, semantic search, trend analysis, and recommendation synthesis, with comprehensive error handling and retry logic throughout the pipeline.

## 🏗️ Architecture & Stack

### Core Technology

- **Frontend**: React 19, Tailwind CSS 4, Vite 7
- **Backend**: Node.js, Express (Custom Agent Orchestrator)
- **Validation**: Automated E2E verification via `src/scripts/verifySystem.ts`
- **AI Models**: Google Gemini 3 Flash (Text/Vision), Gemini 3.1 Pro (Reasoning), Gemini Embedding 2
- **Data**: In-memory Vector Database with Cosine Similarity

### Agent Pipeline

The recommendation pipeline consists of four specialized agents that work together to deliver personalized suggestions:

1. **Profile Builder**: Extracts preferences from text messages and food photos to update the `UserTasteProfile`.
2. **RAG Recommender**: Executes semantic search and applies multi-factor re-ranking based on cuisine, price, and ambiance.
3. **Trend Analyst**: Queries live web data for trending local openings via Google Search.
4. **Finalizer**: Synthesizes agent outputs into validated, structured recommendations.

## 🚀 Key Features

- **Multimodal Inputs**: Infers tastes from chat history and uploaded food photography
- **Explainable AI**: Provides a rationale for every suggestion based on the user profile
- **Real-time Search**: Integrates live Google Search to identify viral dishes and new openings
- **Contextual Filtering**: Supports geolocation, multi-select cuisine tiers, and neighborhood-specific searches
- **Robust UX**: Skeleton screens for perceived performance and local storage for chat persistence
- **Resilient Pipeline**: Exponential backoff retry logic and centralized `AppError` handling
- **System Integrity**: Integrated verification scripts to ensure agent skill reliability and recommendation accuracy

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- Google Gemini API Key

### Installation

1. **Clone & Install**:
   ```bash
   git clone https://github.com/user/dineai.git
   cd dineai
   npm install
   ```

2. **Environment Setup**: Create a `.env` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run**:
   ```bash
   npm run dev
   ```

## 📊 Performance Targets

| Metric | Target |
| --- | --- |
| Retrieval Precision@5 | ≥ 70% |
| Recommendation Relevance | ≥ 4.0 / 5.0 |
| End-to-end Latency | < 15s (P95) |
| Output Validity | 100% (Schema enforced) |
| Heuristic Accuracy | 100% (Normalized Weights: Cuisine 0.4, Price 0.3, Ambiance 0.2, Dietary 0.1) |

## 📄 License

MIT
