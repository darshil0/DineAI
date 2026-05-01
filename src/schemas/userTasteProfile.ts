import { Type } from "@google/genai";

export interface UserTasteProfile {
  cuisines?: string[];
  disliked_cuisines?: string[];
  price_range?: string;
  ambiance?: string[];
  dietary_notes?: string;
  avoid_patterns?: string[];
  special_occasions?: string[];
  neighborhoods?: string[];
}

export const UserTasteProfileSchema = {
  type: Type.OBJECT,
  properties: {
    cuisines: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Preferred cuisines" },
    disliked_cuisines: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Cuisines to avoid" },
    price_range: { type: Type.STRING, description: "Preferred price range, e.g., $, $$, $$$, $$$$" },
    ambiance: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Preferred ambiance or vibe" },
    dietary_notes: { type: Type.STRING, description: "Any dietary restrictions or preferences" },
    avoid_patterns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific patterns or ingredients to avoid" },
    special_occasions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Any special occasions mentioned" },
    neighborhoods: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Preferred neighborhoods or areas" }
  }
};
