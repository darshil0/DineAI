# DineAI🍽️

**DineAI** is an AI-powered restaurant recommendation chatbot that orchestrates multiple specialized agents to deliver personalized, real-time dining suggestions.

The system leverages a custom **Express/Node.js** agent orchestrator with a modular **Agent Skills** architecture, an in-memory vector database for semantic retrieval, **Gemini Structured Outputs** for validation, and a **React/Tailwind** web interface for user interaction—resulting in a production-grade AI pipeline that is both extensible and explainable.

## 🚀 Key Features

-   **Multi-Agent Orchestration**: A specialized pipeline of agents (Profile Builder, RAG Recommender, Trend Analyst, and Finalizer) working together.
-   **Dynamic Taste Profiles**: Automatically infers your preferences from chat history and uploaded food photos.
-   **Semantic Search (RAG)**: Uses Gemini embeddings and a vector database for high-precision restaurant retrieval.
-   **Real-Time Trend Analysis**: Integrates live Google Search data to find trending cuisines, new openings, and viral dishes.
-   **Explainable AI**: Every recommendation provides a narrative explanation PLUS a grounded heuristic rationale (`whyMatch`).
-   **Multimodal Input**: Upload food photos to help the AI understand your visual taste preferences.
-   **Interactive Feedback Loop**: "Like" and "Dislike" system that refines your taste profile in real-time.
-   **Advanced Filtering**: Refine recommendations by multiple cuisines, price tiers, and neighborhoods simultaneously.
-   **Premium UI**: A state-of-the-art visual identity with dark mode, gold accents, and glassmorphism.

## 🛠️ Technology Stack

| Category       | Technology                   | Version / Notes                     |
| -------------- | ---------------------------- | ----------------------------------- |
| **Frontend**   | React 19 + Tailwind CSS 4    | Vite 8 build system, Lucide Icons   |
| **Backend**    | Node.js + Express            | Custom Agent Orchestrator           |
| **AI/LLM**     | Google Gemini API            | `@google/genai` SDK                 |
| **Models**     | `gemini-2.0-flash`           | Text & Vision (Performance Tier)    |
| **Reasoning**  | `gemini-2.5-pro-preview-05-06`| Complex reasoning (Reasoning Tier)  |
| **Embeddings** | `gemini-embedding-2-preview` | Semantic search vectors             |
| **Vector DB**  | Custom In-Memory DB          | Local semantic storage              |
| **Web Search** | Gemini Google Search Tool    | Real-time trend retrieval           |

## 🏗️ System Architecture

DineAI's core is its multi-agent pipeline:

1.  **Profile Builder Agent**: Analyzes messages and photos to create/update a `UserTasteProfile`.
2.  **RAG Recommender Agent**: Performs semantic search and heuristic re-ranking to find candidates.
3.  **Food Trend Analyst Agent**: Searches the web for local food trends relevant to the user.
4.  **Recommendation Finalizer Agent**: Synthesizes all data into a friendly, ranked list of suggestions.

For more details, see [DESIGN.md](./DESIGN.md) and [SKILLS.md](./SKILLS.md).

## 🚦 Getting Started

### Prerequisites

-   **Node.js**: v18.0.0 or higher
-   **npm**: v9.0.0 or higher
-   **Google Gemini API Key**: Obtain one from the [Google AI Studio](https://aistudio.google.com/).

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/darshil0/DineAI.git
    cd DineAI
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```
    *(See `.env.example` for all available options)*

### Running the Application

1.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

2.  **Access the Backend**:
    The Express server runs on `http://localhost:3000`.

## 🛠️ Development

### Available Scripts

-   `npm run dev`: Starts both the Vite frontend and Express backend.
-   `npm run build`: Builds the production-ready frontend.
-   `npm run lint`: Runs TypeScript type checking.
-   `npm run test`: Executes the core library and skill test suites.
-   `npm run verify`: Runs the full end-to-end system verification script.

### Project Structure

-   `/src/components`: React UI components.
-   `/src/services`: Core agent logic and orchestration.
-   `/src/skills`: Modular AI capabilities (extraction, scoring, etc.).
-   `/src/lib`: Shared utilities, Vector DB, and error handling.
-   `/src/data`: Static restaurant knowledge base.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
