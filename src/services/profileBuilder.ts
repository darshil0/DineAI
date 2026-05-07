import { getGeminiClient } from '../lib/geminiClient.js';
import { UserTasteProfileSchema, UserTasteProfile } from '../schemas/index.js';
import { PROFILE_BUILDER_SYSTEM, buildProfilePrompt } from '../prompts/index.js';
import { getSkill } from '../skills/registry.js';
import { ExtractCuisinesInput, ExtractCuisinesOutput } from '../skills/extractCuisines.js';
import { AnalyzeFoodPhotoInput, AnalyzeFoodPhotoOutput } from '../skills/analyzeFoodPhoto.js';
import { AgentServiceError, SkillError } from '../lib/errors.js';
import { withRetry } from '../lib/utils.js';

export async function buildProfile(
  message: string,
  history: string,
  currentProfile: UserTasteProfile | null,
  imageFile?: Express.Multer.File,
): Promise<UserTasteProfile> {
  const ai = getGeminiClient();
  console.log('Running Profile Builder Agent...');

  // 1. Run Skills in parallel to gather insights
  const extractCuisines = getSkill<ExtractCuisinesInput, ExtractCuisinesOutput>('extractCuisines');
  const analyzeFoodPhoto = getSkill<AnalyzeFoodPhotoInput, AnalyzeFoodPhotoOutput>(
    'analyzeFoodPhoto',
  );

  if (!extractCuisines || !analyzeFoodPhoto) {
    throw new Error('Required skills are not registered.');
  }

  // NOTE: .catch() is placed OUTSIDE the withRetry callback so that transient 429/5xx errors
  // can be retried before being converted to a SkillError. If the .catch() were inside the
  // callback, it would intercept every error — including retryable ones — and prevent retries.
  const skillPromises: Promise<any>[] = [
    withRetry(() => extractCuisines.run({ text: message })).catch((e) => {
      throw new SkillError('extractCuisines', e);
    }),
  ];

  if (imageFile) {
    skillPromises.push(
      withRetry(() =>
        analyzeFoodPhoto.run({
          mimeType: imageFile.mimetype,
          data: imageFile.buffer.toString('base64'),
        }),
      ).catch((e) => {
        throw new SkillError('analyzeFoodPhoto', e);
      }),
    );
  }

  const [cuisinesOutput, photoOutput] = await Promise.all(skillPromises);

  // 2. Combine insights and run the final Profile Builder Agent
  let enrichedMessage = message;

  if (cuisinesOutput && cuisinesOutput.cuisines.length > 0) {
    enrichedMessage += `\n\n[Skill Insight: User explicitly mentioned these cuisines: ${cuisinesOutput.cuisines.join(', ')}]`;
  }

  if (photoOutput) {
    enrichedMessage += `\n\n[Skill Insight: User uploaded a photo of ${photoOutput.description}. Inferred cuisines: ${photoOutput.cuisines.join(', ')}. Inferred ambiance: ${photoOutput.ambiance.join(', ')}]`;
  }

  const profileParts: any[] = [
    {
      text: buildProfilePrompt(
        currentProfile ? JSON.stringify(currentProfile) : 'None',
        history,
        enrichedMessage,
      ),
    },
  ];

  try {
    const profileResponse = await withRetry(() =>
      ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: { parts: profileParts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: UserTasteProfileSchema,
          systemInstruction: PROFILE_BUILDER_SYSTEM,
        },
      }),
    );

    let userTasteProfile: UserTasteProfile = {};
    try {
      userTasteProfile = JSON.parse(cleanJson(profileResponse.text || '{}'));
    } catch (parseError) {
      console.error('Failed to parse ProfileBuilder response as JSON:', parseError);
    }

    console.log('Taste Profile:', userTasteProfile);
    return userTasteProfile;
  } catch (error: unknown) {
    if (error instanceof SkillError) throw error;
    throw new AgentServiceError('Profile Builder', error);
  }
}
