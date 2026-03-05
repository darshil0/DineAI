# DineAI Skills & Technology Stack

DineAI is built on a modular **Agent Skills** architecture, where specialized capabilities are encapsulated as independent, reusable functions. These skills are coordinated by a multi-agent orchestrator to provide personalized, real-time restaurant recommendations.

## 🏗️ Agent Skills Architecture

The system uses a centralized `skillRegistry` to manage and compose agent capabilities. Each skill follows a strict interface:

```typescript
export interface AgentSkill<Input, Output> {
  name: string;
  description: string;
  run: (input: Input) => Promise<Output>;
}
```

### Registered Skills

| Skill Name | Description | Key Workflow |
|---|---|---|
| `analyzeFoodPhoto` | Multimodal vision analysis of food photos. | Extracts cuisine, plating, and ambiance signals using Gemini Vision. |
| `extractCuisines` | Logical extraction of cuisine preferences from text. | Parses user natural language into structured cuisine lists. |
| `generateEmbedding` | Semantic vector representation generation. | Converts user queries and restaurant data into high-dimensional vectors. |
| `scoreRestaurant` | Deterministic re-ranking logic. | Calculates relevance scores based on price, ambiance, and dietary compatibility. |

## 🧠 Multi-Agent Orchestration

The skills above empower four specialized agents:

1.  **Profile Builder Agent**: Uses `extractCuisines` and `analyzeFoodPhoto` to build a `UserTasteProfile`.
2.  **RAG Recommender Agent**: Uses `generateEmbedding` for semantic search and `scoreRestaurant` for precision re-ranking.
3.  **Food Trend Analyst Agent**: Utilizes Gemini's Google Search tool to find trending NYC dining spots.
4.  **Recommendation Finalizer Agent**: Synthesizes all data into a ranked, natural-language list of suggestions.

## 💻 Technical Foundation

DineAI leverages a modern, high-performance tech stack:

- **AI Core**: Google Gemini 2.0 Flash (`@google/genai`)
- **Embeddings**: `text-embedding-004`
- **Vector Storage**: Custom in-memory Vector DB (Cosine Similarity)
- **Backend**: Express 5.2 (Node.js v18+)
- **Frontend**: React 19.2 + Tailwind CSS 4 + Motion + Lucide React
- **Type Safety**: TypeScript 5.8 + Zod (Validation)
- **Build System**: Vite 7 + tsx

## 🚀 Developer Guide: Adding a New Skill

To extend the system's capabilities:

1.  **Define the Skill**: Create a new file in `src/skills/` implementing the `AgentSkill` interface.
2.  **Register**: Import and call `registerSkill` in the `bootstrap.ts` file or during system initialization.
3.  **Consume**: Use `getSkill` within an agent service to retrieve and run the capability.

```typescript
import { registerSkill } from "./registry.js";

registerSkill({
  name: "newCapability",
  description: "Does something amazing",
  run: async (input) => { 
    // Implementation logic here
  }
});
```
