# DineAI 🍽️

**DineAI** is an AI-powered restaurant recommendation chatbot that orchestrates multiple specialized agents to deliver personalized, real-time dining suggestions. By combining Retrieval-Augmented Generation (RAG) with Google Gemini embeddings, multimodal vision analysis, and live web search, DineAI builds dynamic user taste profiles that account for personal preferences, budgets, and dining styles.

## 🚀 Key Features

- **Multi-Agent Orchestration**: A specialized pipeline of agents (Profile Builder, RAG Recommender, Trend Analyst, and Finalizer) working together.
- **Dynamic Taste Profiles**: Automatically infers your preferences from chat history and uploaded food photos.
- **Neighborhood-Aware Recommendations**: Specify your preferred areas (e.g., "West Village", "SoHo") to get hyper-local suggestions.
- **Real-Time Trend Analysis**: Integrates live Google Search data to find trending cuisines, new openings, and viral dishes.
- **Semantic Search (RAG)**: Uses Gemini embeddings and a vector database for high-precision restaurant retrieval.
- **Explainable AI**: Every recommendation comes with a personalized rationale explaining exactly why it fits your taste.

## 🛠️ Technology Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express
- **AI/LLM**: Google Gemini API (`@google/genai`)
- **Embeddings**: Gemini `text-embedding-004`
- **Vector Database**: Custom in-memory vector store
- **Search**: Gemini Google Search Tool

## 🏗️ Architecture

DineAI uses a modular **Agent Skills** architecture:
1. **Profile Builder**: Analyzes messages and photos to create a `UserTasteProfile`.
2. **RAG Recommender**: Performs semantic search and rule-based re-ranking to find candidate restaurants.
3. **Trend Analyst**: Searches the web for local food trends and classifies their relevance to your profile.
4. **Finalizer**: Synthesizes all data into a friendly, ranked list of recommendations.

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
