import { Router, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { z } from 'zod';
import { buildProfile } from '../services/profileBuilder.js';
import { recommendCandidates } from '../services/ragRecommender.js';
import { analyzeTrends } from '../services/trendAnalyst.js';
import { finalizeRecommendations } from '../services/finalizer.js';
import { handleApiError, ValidationError } from '../lib/errors.js';
import { UserTasteProfile } from '../schemas/index.js';
import { authenticateApiKey } from './middleware/auth.js';
import { createRateLimiter } from './middleware/rateLimit.js';

const router = Router();

// Apply auth and rate limiting to chat router
const chatRateLimiter = createRateLimiter({ windowMs: 60000, max: 20 });
router.use(authenticateApiKey);
router.use(chatRateLimiter);

// Robust Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.'));
    }
  },
});

// Middleware wrapper for Multer to catch upload size / type errors cleanly
function handleUpload(req: Request, res: Response, next: NextFunction) {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(413).json({ error: 'File size exceeds the 5MB limit.' });
          return;
        }
        res.status(400).json({ error: `Upload error: ${err.message}` });
        return;
      }
      res.status(400).json({ error: err.message || 'Invalid upload request.' });
      return;
    }
    next();
  });
}

// Zod schemas for validation
const HistorySchema = z.array(
  z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000),
  }),
);

router.post('/', handleUpload, async (req: Request, res: Response) => {
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
        const validated = HistorySchema.parse(parsed);
        history = validated.slice(-10);
      } catch (e) {
        console.warn('Invalid history format provided, ignoring.', e);
      }
    }

    let currentProfile: UserTasteProfile | null = null;
    if (profileStr) {
      try {
        const parsed = JSON.parse(profileStr);
        const { UserTasteProfileZodSchema } = await import('../schemas/index.js');
        currentProfile = UserTasteProfileZodSchema.parse(parsed) as UserTasteProfile;
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

    if (!userTasteProfile) {
      throw new ValidationError('Failed to build user taste profile.');
    }

    const profileDuration = Date.now() - startProfile;
    console.log(`[Telemetry] ProfileBuilder lat=${profileDuration}ms`);

    // 3 & 4. Run RAG Recommender and Trend Analyst in parallel
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
  } catch (error: any) {
    handleApiError(res, error);
  }
});

export default router;
