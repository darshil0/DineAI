import { scoreRestaurantSkill } from '../scoreRestaurant.js';

async function testScoreRestaurant() {
  console.log('--- Testing scoreRestaurant ---');

  const profile = {
    cuisines: ['Italian'],
    price_range: '$$',
    ambiance: ['Casual'],
    dietary_notes: 'Vegetarian',
    neighborhoods: ['West Village'],
  };

  const restaurant = {
    id: '1',
    name: "L'Artusi",
    cuisine: 'Italian',
    price_tier: '$$' as const,
    neighborhood: 'West Village',
    rating: 4.8,
    description: 'Bustling, bi-level space for elevated Italian comfort food & a long wine list.',
    tags: ['date night', 'pasta', 'wine', 'lively ambiance', 'vegetarian friendly', 'casual'],
  };

  try {
    // 1. Perfect match (with similarity)
    const { matchScore: score1, rationale: rationale1 } = await scoreRestaurantSkill.run({ 
      profile, 
      restaurant,
      similarity: 0.9,
    });
    console.log(`✅ Perfect match score: ${score1.toFixed(2)} (Expected: ~1.0)`);
    console.log(`   Rationale: ${rationale1}`);

    // 2. Mismatch cuisine (without similarity)
    const { matchScore: score2, rationale: rationale2 } = await scoreRestaurantSkill.run({
      profile: { ...profile, cuisines: ['French'] },
      restaurant,
    });
    console.log(`✅ Mismatch cuisine score: ${score2.toFixed(2)} (Expected: ~0.7)`);
    console.log(`   Rationale: ${rationale2}`);

    // 3. Mismatch price (price diff=2, gets half weight)
    const { matchScore: score3, rationale: rationale3 } = await scoreRestaurantSkill.run({
      profile: { ...profile, price_range: '$$$$' },
      restaurant,
    });
    console.log(`✅ Mismatch price score: ${score3.toFixed(2)} (Expected: ~0.85)`);
    console.log(`   Rationale: ${rationale3}`);

    // 4. Mismatch neighborhood
    const { matchScore: score4, rationale: rationale4 } = await scoreRestaurantSkill.run({
      profile: { ...profile, neighborhoods: ['Midtown'] },
      restaurant,
    });
    console.log(`✅ Mismatch neighborhood score: ${score4.toFixed(2)} (Expected: ~0.85)`);
    console.log(`   Rationale: ${rationale4}`);

    // 5. Mismatch ambiance
    const { matchScore: score5, rationale: rationale5 } = await scoreRestaurantSkill.run({
      profile: { ...profile, ambiance: ['Formal'] },
      restaurant,
    });
    console.log(`✅ Mismatch ambiance score: ${score5.toFixed(2)} (Expected: ~0.85)`);
    console.log(`   Rationale: ${rationale5}`);

    // 6. Mismatch dietary
    const { matchScore: score6, rationale: rationale6 } = await scoreRestaurantSkill.run({
      profile: { ...profile, dietary_notes: 'Gluten-Free' },
      restaurant,
    });
    console.log(`✅ Mismatch dietary score: ${score6.toFixed(2)} (Expected: ~1.0)`);
    console.log(`   Rationale: ${rationale6}`);

    // 7. Low similarity match
    const { matchScore: score7, rationale: rationale7 } = await scoreRestaurantSkill.run({
      profile,
      restaurant,
      similarity: 0.2,
    });
    console.log(`✅ Low similarity score: ${score7.toFixed(2)} (Expected: ~0.56)`);
    console.log(`   Rationale: ${rationale7}`);

    // 8. Error handling test - empty profile
    try {
      const { matchScore: score8 } = await scoreRestaurantSkill.run({
        profile: { cuisines: [], price_range: undefined, ambiance: [], dietary_notes: '', neighborhoods: [] },
        restaurant,
      });
      console.log(`✅ Empty profile score: ${score8.toFixed(2)} (Expected: 0.0)`);
    } catch (error) {
      console.error('❌ Failed for empty profile:', error);
    }

    console.log('--- scoreRestaurant Tests Complete ---');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

testScoreRestaurant();
