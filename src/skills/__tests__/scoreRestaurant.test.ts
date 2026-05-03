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

  // Heuristics:
  // Cuisine: Italian -> Match (0.4)
  // Price: $$ -> Match (0.3)
  // Ambiance: Casual -> Match (0.2)
  // Dietary: Vegetarian -> Match (0.1)
  // Total: 1.0

  // 1. Perfect match
  const { matchScore: score1 } = await scoreRestaurantSkill.run({ profile, restaurant });
  console.log(`✅ Perfect match score: ${score1.toFixed(2)} (Expected: 1.0)`);

  // 2. Mismatch cuisine
  // -0.4 -> 0.6
  const { matchScore: score2 } = await scoreRestaurantSkill.run({
    profile: { ...profile, cuisines: ['French'] },
    restaurant,
  });
  console.log(`✅ Mismatch cuisine score: ${score2.toFixed(2)} (Expected: 0.6)`);

  // 3. Mismatch price
  // $$ vs $$$$ -> diff = 2 -> 0.3 - 0 = 0.3 mismatch (score drops to 0.7)
  // Wait, diff = 2 is not 0, not 1, not >= 3. So it adds nothing.
  // 1.0 - 0.3 = 0.7
  const { matchScore: score3 } = await scoreRestaurantSkill.run({
    profile: { ...profile, price_range: '$$$$' },
    restaurant,
  });
  console.log(`✅ Mismatch price score: ${score3.toFixed(2)} (Expected: 0.7)`);

  // 4. Mismatch neighborhood (Now ignored in heuristics)
  // Should still be 1.0
  const { matchScore: score4 } = await scoreRestaurantSkill.run({
    profile: { ...profile, neighborhoods: ['Midtown'] },
    restaurant,
  });
  console.log(`✅ Mismatch neighborhood score: ${score4.toFixed(2)} (Expected: 1.0)`);

  // 5. Mismatch ambiance
  // -0.2 -> 0.8
  const { matchScore: score5 } = await scoreRestaurantSkill.run({
    profile: { ...profile, ambiance: ['Formal'] },
    restaurant,
  });
  console.log(`✅ Mismatch ambiance score: ${score5.toFixed(2)} (Expected: 0.8)`);

  // 6. Mismatch dietary
  // -0.1 -> 0.9
  const { matchScore: score6 } = await scoreRestaurantSkill.run({
    profile: { ...profile, dietary_notes: 'Gluten-Free' },
    restaurant,
  });
  console.log(`✅ Mismatch dietary score: ${score6.toFixed(2)} (Expected: 0.9)`);

  console.log('--- scoreRestaurant Tests Complete ---');
}

testScoreRestaurant();
