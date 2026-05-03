# DineAI 🍽️

**DineAI** is an AI-powered restaurant recommendation chatbot that orchestrates multiple specialized agents to deliver personalized, real-time dining suggestions. By combining Retrieval-Augmented Generation (RAG) with Google Gemini embeddings, multimodal vision analysis, and live web search, DineAI builds dynamic user taste profiles that account for personal preferences, budgets, and dining styles.

The system leverages a custom **Express/Node.js** agent orchestrator with a modular **Agent Skills** architecture, an in-memory vector database for semantic retrieval, **Gemini Structured Outputs** for validation, and a **React/Tailwind** web interface for user interaction.

## 🚀 Key Features

- **Health & Stability**: Optimized environment with resolved dependency conflicts and restored CI/CD health.
- **Normalized Scoring Engine**: Precisely weighted multi-factor scoring (Cuisine, Price, Ambiance, Dietary) for more predictable recommendations.
- **Personalized Onboarding**: An interactive tutorial that guides new users through DineAI's unique multi-agent features.
- **Favorites Gallery**: Save restaurants you love and view your curated collection in a dedicated favorites tab.
- **Chat History Persistence**: Conversations are saved to local storage, allowing you to pick up where you left off.
- **Multi-Agent Orchestration**: A specialized pipeline of agents (Profile Builder, RAG Recommender, Trend Analyst, and Finalizer) working together.
- **Adaptive Feedback Loop**: "Like" and "Dislike" system that refines your taste profile in real-time.
- **Advanced Multi-Select Filtering**: Instantly refine recommendations by multiple cuisines, price tiers, and neighborhoods simultaneously via an intuitive dropdown interface.
- **Semantic Search (RAG)**: Uses Gemini embeddings and a vector database for high-precision restaurant retrieval.
- **Real-Time Trend Analysis**: Integrates live Google Search data to find trending cuisines, new openings, and viral dishes.
- **Voice-to-Text Integration**: Hands-free interaction with the chat interface using built-in speech recognition.

## 🛠️ Technology Stack

| Category   | Technology               | Version / Notes                     |
| ---------- | ------------------------ | ----------------------------------- |
| Frontend   | React 19 + Tailwind 4    | Vite 7 build system, Lucide Icons   |
| Backend    | Node.js + Express        | Custom Agent Orchestrator           |
| AI/LLM     | Google Gemini API        | `@google/genai` SDK                 |
| Models     | `gemini-3-flash-preview` | Text & Vision analysis              |
| Reasoning  | `gemini-3.1-pro-preview` | Complex agent reasoning             |
| Embeddings | `gemini-embedding-2-preview` | Used for semantic search            |
| Vector DB  | Custom In-Memory DB      | Local semantic storage              |

## 🏗️ System Architecture

DineAI comprises four coordinated layers that can operate sequentially or in parallel:

1.  **Profile Builder Agent**: Analyzes messages and photos to create a `UserTasteProfile`.
2.  **RAG Recommender Agent**: Performs semantic search and rule-based re-ranking to find candidate restaurants.
3.  **Food Trend Analyst Agent**: Searches the web for local food trends and classifies their relevance to your profile.
4.  **Recommendation Finalizer Agent**: Synthesizes all data into a friendly, ranked list of recommendations.

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

## 📄 License

MIT
