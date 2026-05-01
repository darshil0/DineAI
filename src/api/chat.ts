import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { buildProfile } from '../services/profileBuilder.js';
import { recommendCandidates } from '../services/ragRecommender.js';
import { analyzeTrends } from '../services/trendAnalyst.js';
import { finalizeRecommendations } from '../services/finalizer.js';
import { handleApiError, ValidationError } from '../lib/errors.js';

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

    let history = [];
    if (historyStr) {
      try {
        const parsed = JSON.parse(historyStr);
        history = HistorySchema.parse(parsed);
      } catch (e) {
        console.warn('Invalid history format provided, ignoring.', e);
      }
    }

    let currentProfile = null;
    if (profileStr) {
      try {
        currentProfile = JSON.parse(profileStr);
      } catch (e) {
        console.warn('Invalid profile format provided, ignoring.', e);
      }
    }

    // 2. Profile Builder Agent
    const userTasteProfile = await buildProfile(
      sanitizedMessage,
      JSON.stringify(history),
      currentProfile,
      imageFile,
    );

    // 3 & 4. Run RAG Recommender and Trend Analyst in parallel
    const locationMatch = sanitizedMessage.match(/\[Near my current location: ([\d.-]+), ([\d.-]+)\]/);
    const trendLocation = locationMatch ? `Area near ${locationMatch[1]}, ${locationMatch[2]}` : 'New York City';

    const [candidateList, trendReportText] = await Promise.all([
      recommendCandidates(userTasteProfile),
      analyzeTrends(userTasteProfile, trendLocation),
    ]);

    // 5. Recommendation Finalizer Agent
    const finalRecommendations = await finalizeRecommendations(
      userTasteProfile,
      sanitizedMessage,
      candidateList,
      trendReportText,
      JSON.stringify(history),
    );

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
