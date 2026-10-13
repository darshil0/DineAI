import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateCacheKey } from '../ingestRestaurants.js';
import { MODELS } from '../../config/models.js';

describe('Ingestion & Cache Key Tests', () => {
  it('should generate unique cache keys including model name, name, neighborhood, address, and cuisine', () => {
    const restaurant1 = {
      name: 'Katz Delicatessen',
      neighborhood: 'Lower East Side',
      address: '205 E Houston St',
      cuisine: 'Jewish Deli',
      price_tier: '$$',
      tags: ['historic', 'sandwiches'],
      description: 'Famous deli',
    };

    const restaurant2 = {
      name: 'Katz Delicatessen',
      neighborhood: 'Lower East Side',
      address: '100 Other St',
      cuisine: 'Jewish Deli',
      price_tier: '$$',
      tags: ['historic'],
      description: 'Second location',
    };

    const key1 = generateCacheKey(restaurant1 as any);
    const key2 = generateCacheKey(restaurant2 as any);

    assert.ok(key1.startsWith(MODELS.EMBEDDING));
    assert.ok(key1.includes('katz-delicatessen-lower-east-side'));
    assert.ok(key1.includes('205-e-houston-st'));
    assert.notStrictEqual(key1, key2);
  });
});
