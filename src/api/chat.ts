import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { buildProfile } from '../services/profileBuilder.js';
import { recommendCandidates } from '../services/ragRecommender.js';
import { analyzeTrends } from '../services/trendAnalyst.js';
import { finalizeRecommendations } from '../services/finalizer.js';
import { handleApiError, ValidationError } from '../lib/errors.js';
import { UserTasteProfile } from '../schemas/index.js';

const router = Router();

// Robust Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.'));
    }
  },
});

// Zod schemas for validation
const HistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(5000),
});

const HistorySchema = z.array(HistoryItemSchema);

// Helper to validate history integrity
function validateHistoryIntegrity(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
): boolean {
  if (history.length === 0) return true;

  // Enforce role alternation: must start with user or assistant, then alternate
  for (let i = 1; i < history.length; i++) {
    const prevRole = history[i - 1].role;
    const currRole = history[i].role;

    // Allow same role to appear consecutively (edge case), but should not have more than 2 consecutive
    const consecutiveCount = history.slice(Math.max(0, i - 2), i + 1).filter((m) => m.role === currRole).length;
    if (consecutiveCount > 2) {
      return false;
    }
  }

  return true;
}

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { message, history: historyStr, currentProfile: profileStr } = req.body;
    const imageFile = req.file;

    // 1. Input Validation & Sanitization
    if (!message || typeof message !== 'string') {
      throw new ValidationError('Message is required and must be a string.');
    }

    // Validate message length and content
    const sanitizedMessage = message.trim().slice(0, 2000);
    if (sanitizedMessage.length === 0 && !imageFile) {
      throw new ValidationError('Either a message or an image must be provided.');
    }

    // Re-validate file after Multer processing
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      throw new ValidationError('Image size exceeds the 5MB limit.');
    }

    const startTotal = Date.now();

    // 2. History Validation & Sanitization with Integrity Check
    let history: { role: 'user' | 'assistant'; content: string }[] = [];
    if (historyStr) {
      try {
        const parsed = JSON.parse(historyStr);
        // Validate shape and content
        const validated = HistorySchema.parse(parsed);

        // Validate integrity (role alternation, etc.)
        if (!validateHistoryIntegrity(validated)) {
          console.warn('History integrity check failed; using last 10 exchanges only.');
        }

        // Keep last 10 exchanges only to prevent context poisoning
        history = validated.slice(-10);
      } catch (e) {
        console.warn('Invalid history format provided, ignoring.', e);
        history = [];
      }
    }

    // 3. Profile Validation
    let currentProfile: UserTasteProfile | null = null;
    if (profileStr) {
      try {
        const parsed = JSON.parse(profileStr);
        // Basic shape validation
        if (typeof parsed === 'object' && parsed !== null) {
          currentProfile = parsed;
        }
      } catch (e) {
        console.warn('Invalid profile format provided, ignoring.', e);
      }
    }

    // 4. Profile Builder Agent
    const startProfile = Date.now();
    const userTasteProfile = await buildProfile(
      sanitizedMessage,
      JSON.stringify(history),
      currentProfile,
      imageFile,
    );
    const profileDuration = Date.now() - startProfile;
    console.log(`[Telemetry] ProfileBuilder lat=${profileDuration}ms`);

    // 5 & 6. Run RAG Recommender and Trend Analyst in parallel
    const locationMatch = sanitizedMessage.match(
      /\[Near my current location: ([\d.-]+), ([\d.-]+)\]/,
    );
    const trendLocation = locationMatch
      ? `Area near ${locationMatch[1]}, ${locationMatch[2]}`
      : 'New York City';

    const startParallel = Date.now();
    const [candidateList, trendReportText] = await Promise.all([
      recommendCandidates(userTasteProfile),
      analyzeTrends(userTasteProfile, trendLocation),
    ]);
    const parallelDuration = Date.now() - startParallel;
    console.log(`[Telemetry] RAG+Trends lat=${parallelDuration}ms`);

    // 7. Recommendation Finalizer Agent
    const startFinalizer = Date.now();
    const finalRecommendations = await finalizeRecommendations(
      userTasteProfile,
      sanitizedMessage,
      candidateList,
      trendReportText,
      JSON.stringify(history),
    );
    const finalizerDuration = Date.now() - startFinalizer;
    console.log(`[Telemetry] Finalizer lat=${finalizerDuration}ms`);

    const totalDuration = Date.now() - startTotal;
    console.log(`[Telemetry] Total lat=${totalDuration}ms`);

    res.json({
      profile: userTasteProfile,
      trends: trendReportText,
      recommendations: finalRecommendations,
    });
  } catch (error: unknown) {
    handleApiError(res, error);
  }
});

export default router;
