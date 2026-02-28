import { getGeminiClient, GEMINI_MODEL } from "../lib/geminiClient.js";
import { cleanJson } from "../lib/utils.js";
import { logger } from "../lib/logger.js";
import { UserTasteProfileSchema, UserTasteProfile } from "../schemas/index.js";
import {
  PROFILE_BUILDER_SYSTEM,
  buildProfilePrompt,
} from "../prompts/index.js";
import { getSkill } from "../skills/registry.js";
import {
  ExtractCuisinesInput,
  ExtractCuisinesOutput,
} from "../skills/extractCuisines.js";
import {
  AnalyzeFoodPhotoInput,
  AnalyzeFoodPhotoOutput,
} from "../skills/analyzeFoodPhoto.js";

export async function buildProfile(
  message: string,
  history: string,
  currentProfile: string,
  imageFile?: Express.Multer.File,
): Promise<UserTasteProfile> {
  const ai = getGeminiClient();
  logger.info("ProfileBuilder", "Running Profile Builder Agent...");

  // 1. Run Skills in parallel to gather insights
  const extractCuisines = getSkill<ExtractCuisinesInput, ExtractCuisinesOutput>(
    "extractCuisines",
  );
  const analyzeFoodPhoto = getSkill<
    AnalyzeFoodPhotoInput,
    AnalyzeFoodPhotoOutput
  >("analyzeFoodPhoto");

  if (!extractCuisines || !analyzeFoodPhoto) {
    throw new Error("Required skills are not registered.");
  }

  const skillPromises: Promise<any>[] = [
    extractCuisines.run({ text: message }),
  ];

  if (imageFile) {
    skillPromises.push(
      analyzeFoodPhoto.run({
        mimeType: imageFile.mimetype,
        data: imageFile.buffer.toString("base64"),
      }),
    );
  }

  const [cuisinesOutput, photoOutput] = await Promise.all(skillPromises);

  // 2. Combine insights and run the final Profile Builder Agent
  let enrichedMessage = message;

  if (cuisinesOutput && cuisinesOutput.cuisines.length > 0) {
    enrichedMessage += `\n\n[Skill Insight: User explicitly mentioned these cuisines: ${cuisinesOutput.cuisines.join(", ")}]`;
  }

  if (photoOutput) {
    enrichedMessage += `\n\n[Skill Insight: User uploaded a photo of ${photoOutput.description}. Inferred cuisines: ${photoOutput.cuisines.join(", ")}. Inferred ambiance: ${photoOutput.ambiance.join(", ")}]`;
  }

  const profileParts: any[] = [
    {
      text: buildProfilePrompt(currentProfile, history, enrichedMessage),
    },
  ];

  try {
    const profileResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ parts: profileParts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: UserTasteProfileSchema,
        systemInstruction: {
          parts: [{ text: PROFILE_BUILDER_SYSTEM }],
        },
      },
    });

    const userTasteProfile = JSON.parse(
      cleanJson(
        profileResponse.candidates?.[0]?.content?.parts?.[0]?.text || "{}",
      ),
    );

    const hasMeaningfulFields =
      (userTasteProfile.cuisines && userTasteProfile.cuisines.length > 0) ||
      userTasteProfile.price_range ||
      (userTasteProfile.ambiance && userTasteProfile.ambiance.length > 0) ||
      (userTasteProfile.dietary_notes && userTasteProfile.dietary_notes.toLowerCase() !== "none") ||
      (userTasteProfile.special_occasions && userTasteProfile.special_occasions.length > 0);

    if (!hasMeaningfulFields) {
      throw new Error("Could not extract any meaningful dining preferences. Please try again with more details.");
    }

    logger.info("ProfileBuilder", "Taste Profile generated successfully.");
    return userTasteProfile;
  } catch (error: any) {
    logger.error("ProfileBuilder", "Error in Profile Builder Agent:", error);
    throw new Error(`Profile Builder failed: ${error.message}`, { cause: error });
  }
}
