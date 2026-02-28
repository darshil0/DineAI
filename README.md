<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6991651b-a322-44dd-b708-0413e783338e

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy the environment template and configure your API key:
   `cp .env.example .env.local`
   Then open `.env.local` and set `GEMINI_API_KEY` to your Gemini API key.
3. Run the app:
   `npm run dev`

## Notes

- **AI SDK & Model:** This project is optimized for the `@google/genai` (SDK 1.43.0+) using the `gemini-2.0-flash` model. Request and response structures are standardized for this version pairing.
