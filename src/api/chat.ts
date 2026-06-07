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
      // FIX 1: Use regular Error instead of ValidationError in fileFilter
      // Multer expects standard Error objects in fileFilter
      cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.'));
    }
  },
});

// Zod schemas for validation
const HistorySchema = z.array(
  z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000),
  }),
);

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { message, history: historyStr, currentProfile: profileStr } = req.body;
    const imageFile = req.file;

    // 1. Input Validation & Sanitization
    if (!message || typeof message !== 'string') {
      throw new ValidationError('Message is required and must be a string.');
    }

    const sanitizedMessage = message.trim().slice(0, 2000);
    const startTotal = Date.now();

    let history: { role: 'user' | 'assistant'; content: string }[] = [];
    if (historyStr) {
      try {
        const parsed = JSON.parse(historyStr);
        // Validating shape first
        const validated = HistorySchema.parse(parsed);
        // Sanitization: last 10 exchanges only
        history = validated.slice(-10);
      } catch (e) {
        console.warn('Invalid history format provided, ignoring.', e);
      }
    }

    let currentProfile: UserTasteProfile | null = null;
    if (profileStr) {
      try {
        // FIX 2: Validate currentProfile against UserTasteProfile schema
        const parsed = JSON.parse(profileStr);
        currentProfile = UserTasteProfile.parse(parsed);
      } catch (e) {
        console.warn('Invalid profile format provided, ignoring.', e);
      }
    }

    // 2. Profile Builder Agent
    const startProfile = Date.now();
    const userTasteProfile = await buildProfile(
      sanitizedMessage,
      JSON.stringify(history),
      currentProfile,
      imageFile,
    );
    
    // FIX 3: Add null check for userTasteProfile
    if (!userTasteProfile) {
      throw new ValidationError('Failed to build user taste profile.');
    }
    
    const profileDuration = Date.now() - startProfile;
    console.log(`[Telemetry] ProfileBuilder lat=${profileDuration}ms`);

    // 3 & 4. Run RAG Recommender and Trend Analyst in parallel
    const locationMatch = sanitizedMessage.match(/\[Near my current location: ([\d.-]+), ([\d.-]+)\]/);
    const trendLocation = locationMatch ? `Area near ${locationMatch[1]}, ${locationMatch[2]}` : 'New York City';

    const startParallel = Date.now();
    const [candidateList, trendReportText] = await Promise.all([
      recommendCandidates(userTasteProfile),
      analyzeTrends(userTasteProfile, trendLocation),
    ]);
    const parallelDuration = Date.now() - startParallel;
    console.log(`[Telemetry] RAG+Trends lat=${parallelDuration}ms`);

    // 5. Recommendation Finalizer Agent
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
  } catch (error) {
    // FIX 4: Remove TypeScript type annotation (error: unknown) for .js file
    handleApiError(res, error);
  }
});

export default router;
