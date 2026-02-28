import { Type } from "@google/genai";

export interface UserTasteProfile {
  cuisines?: string[];
  price_range?: string;
  ambiance?: string[];
  dietary_notes?: string;
  special_occasions?: string[];
}

export const UserTasteProfileSchema = {
  type: Type.OBJECT,
  properties: {
    cuisines: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Preferred cuisines",
    },
    price_range: {
      type: Type.STRING,
      description: "Preferred price range, e.g., $, $$, $$$, $$$$",
    },
    ambiance: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Preferred ambiance or vibe",
    },
    dietary_notes: {
      type: Type.STRING,
      description: "Any dietary restrictions or preferences",
    },
    special_occasions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Any special occasions mentioned",
    },
  },
};
