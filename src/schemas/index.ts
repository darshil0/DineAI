// If exporting types only (TypeScript):
export type * from './userTasteProfile.js';
export type * from './recommendation.js';

// If exporting both types and values:
export { UserTasteProfile } from './userTasteProfile.js';
export { Recommendation } from './recommendation.js';

// Or with explicit renaming to avoid collisions:
export { 
  UserTasteProfile,
  // other named exports
} from './userTasteProfile.js';

export { 
  Recommendation,
  RecommendationInput,
  RecommendationOutput
} from './recommendation.js';
