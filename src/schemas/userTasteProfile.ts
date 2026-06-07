import { Type } from '@google/genai';

/**
 * Represents a user's dining preferences and taste profile
 * for restaurant recommendation matching.
 */
export interface UserTasteProfile {
  cuisines?: string[];              // Preferred cuisines
  disliked_cuisines?: string[];     // Cuisines to avoid
  price_range?: string;             // Preferred price range ($, $$, $$$, $$$$)
  ambiance?: string[];              // Preferred ambiance or vibe
  dietary_notes?: string;           // Dietary restrictions or preferences
  avoid_patterns?: string[];        // Specific patterns/ingredients to avoid
  special_occasions?: string[];     // Any special occasions mentioned
  neighborhoods?: string[];         // Preferred neighborhoods or areas
}

/**
 * JSON schema for structured output from Gemini API
 * for extracting user taste profiles from natural language.
 */
export const UserTasteProfileSchema = {
  type: Type.OBJECT,
  properties: {
    cuisines: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: 'Preferred cuisines',
      minItems: 1,
    },
    disliked_cuisines: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Cuisines to avoid',
      minItems: 1,
    },
    price_range: {
      type: Type.STRING,
      description: 'Preferred price range, e.g., $, $$, $$$, $$$$',
      enum: ['$', '$$', '$$$', '$$$$'],
    },
    ambiance: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Preferred ambiance or vibe',
      minItems: 1,
    },
    dietary_notes: { 
      type: Type.STRING, 
      description: 'Any dietary restrictions or preferences',
    },
    avoid_patterns: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Specific patterns or ingredients to avoid',
      minItems: 1,
    },
    special_occasions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Any special occasions mentioned',
      minItems: 1,
    },
    neighborhoods: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Preferred neighborhoods or areas',
      minItems: 1,
    },
  },
  // No required array since all properties are optional
};
