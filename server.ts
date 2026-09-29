import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { generateGeminiInsights, getDefaultInsights, generatePlacementStrategy } from './src/server/geminiService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini insights endpoint
app.post('/api/generate-insights', async (req, res) => {
  try {
    const metrics = req.body;
    const insights = await generateGeminiInsights(metrics);
    res.json(insights);
  } catch (err) {
    console.error('Error generating insights:', err);
    res.json(getDefaultInsights(null));
  }
});

// Server-side Dynamic Ad Placement Advisor strategy endpoint
app.post('/api/generate-placement-strategy', async (req, res) => {
  try {
    const reqData = req.body;
    const strategy = await generatePlacementStrategy(reqData);
    res.json(strategy);
  } catch (err) {
    console.error('Error generating placement strategy:', err);
    res.status(500).json({ error: 'Failed to generate strategy' });
  }
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Google Mira (Path to Conversion Insights) server listening on port ${PORT}`);
});
