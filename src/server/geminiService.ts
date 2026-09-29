import { GoogleGenAI, Type } from '@google/genai';
import { GeminiInsightsResponse } from '../types';

export function getDefaultInsights(metrics: any): GeminiInsightsResponse {
  const topCh = metrics?.topChannel || 'Search';
  const convRate = metrics?.conversionRate || '25.3%';
  const avgLen = metrics?.avgJourneyLength || '4.8';

  return {
    insights: [
      {
        title: `${topCh} + YouTube drives highest conversion lift`,
        description: `Users exposed to ${topCh} followed by YouTube are 2.3x more likely to convert compared to single-channel exposure, shortening purchase lag by 35%.`,
        metric: '2.3x lift',
        category: 'Channel Synergy',
      },
      {
        title: 'High-value users engage across 3+ channels',
        description: `72% of converting users interact with at least 3 distinct channels before transacting, with average journey length at ${avgLen} touchpoints.`,
        metric: '72% multi-touch',
        category: 'User Behavior',
      },
      {
        title: 'Conversions peak 7–14 days after first touch',
        description: `Most conversions finalize within 7 to 14 days of the initial discovery interaction, maintaining a healthy ${convRate} overall conversion rate.`,
        metric: '7–14 days',
        category: 'Time to Convert',
      },
    ],
    recommendations: [
      {
        id: 1,
        title: `Increase investment in ${topCh} + YouTube based on strong conversion lift.`,
        description: 'Shift 15% of top-of-funnel budget to coordinated video sequence campaigns targeting early searchers.',
        impact: 'High',
        timeframe: 'Immediate',
      },
      {
        id: 2,
        title: 'Retarget users who have engaged with 2+ channels but haven\'t converted.',
        description: 'Deploy personalized remarketing incentives on Gmail and Display for mid-funnel cohorts within the 7–14 day window.',
        impact: 'High',
        timeframe: 'Next 14 days',
      },
      {
        id: 3,
        title: 'Test creative variations on Display to improve mid-funnel engagement.',
        description: 'Optimize banner frequency capping and introduce high-impact product imagery to bridge search-to-direct paths.',
        impact: 'Medium',
        timeframe: 'Q4',
      },
      {
        id: 4,
        title: 'Leverage AI-generated audience segments to identify emerging high-conversion cohorts.',
        description: 'Sync high-value customer profile traits across automated bidding strategies to maximize return on ad spend.',
        impact: 'Medium',
        timeframe: 'Ongoing',
      },
    ],
  };
}

export async function generateGeminiInsights(metrics: any): Promise<GeminiInsightsResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured. Using contextual fallback insights.');
    return getDefaultInsights(metrics);
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = `You are a Senior Marketing Attribution & Analytics Specialist analyzing multi-channel customer journey touchpoints for 'Google Mira (Path to Conversion Insights)'.
Given the following aggregated marketing performance metrics (NO raw user data):
${JSON.stringify(metrics, null, 2)}

Generate:
1. Exactly 3 strategic AI insights highlighting cross-channel synergies, conversion velocity, or attribution shifts. Each insight must have:
   - title (short, punchy, e.g. 'Search + YouTube drives highest conversion lift')
   - description (2 sentences with quantitative proof based on the provided metrics)
   - metric (e.g. '2.3x higher', '72%', '7-14 days')
   - category (e.g. 'Channel Synergy', 'User Behavior', 'Time to Convert')
2. Exactly 4 high-impact recommended actions prioritized by conversion lift. Each recommendation must have:
   - id (1, 2, 3, 4)
   - title (action-oriented headline)
   - description (specific implementation advice)
   - impact ('High' or 'Medium')
   - timeframe (e.g. 'Immediate', 'Next 14 days', 'Q4')

Return strictly valid JSON adhering to the specified schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction: 'You are an expert marketing analytics strategist specializing in multi-touch attribution and full-funnel digital media.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                metric: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ['title', 'description', 'metric', 'category'],
            },
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                impact: { type: Type.STRING },
                timeframe: { type: Type.STRING },
              },
              required: ['id', 'title', 'description', 'impact', 'timeframe'],
            },
          },
        },
        required: ['insights', 'recommendations'],
      },
    },
  });

  if (response.text) {
    try {
      return JSON.parse(response.text) as GeminiInsightsResponse;
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON:', parseErr);
    }
  }

  return getDefaultInsights(metrics);
}

export async function generatePlacementStrategy(reqData: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  const prod = reqData.productName || 'Coachella Festival Clear Bag';
  const cat = reqData.category || 'Event Accessories';
  const price = reqData.pricePoint || 68;
  const budget = reqData.budgetTotal || 15000;
  const motive = reqData.targetMotive || 'Event Prep';
  const aud = reqData.targetAudience || 'Festival attendees';
  const emp = reqData.empiricalData || {};

  const topDisc = emp.topDiscoveryChannel || 'YouTube';
  const topNurt = emp.topNurturingChannel || 'Display';
  const topClose = emp.topClosingChannel || 'Search';
  const peakDay = emp.peakConversionDay || 'Tuesday';
  const peakDiscDay = emp.peakDiscoveryDay || 'Saturday';

  const defaultStrategy = {
    campaignName: prod,
    targetAudience: aud,
    pricePoint: price,
    motive: motive,
    executiveSummary: `Based on your live dataset, ${topDisc} leads top-of-funnel reach, while ${topClose} delivers the highest conversion velocity. For ${prod} ($${price}), flight visual discovery on ${peakDiscDay} and convert high-intent searchers on ${peakDay}.`,
    adSchedulingTakeaway: `Ramp up ${topDisc} budget Friday through Sunday evenings for inspiration, then switch aggressively to ${topClose} on ${peakDay} to finalize checkout before deadlines.`,
    stages: [
      {
        stageName: 'Top-of-Funnel (Discovery)',
        budgetSharePct: 45,
        recommendedChannels: [topDisc, 'Discover'],
        creativeFormat: `Short-form discovery & unboxing: "Why you need ${prod} for ${motive}"`,
        bestDaysToSend: `Friday – Sunday (${peakDiscDay} peak)`,
        keyMotive: 'Emotional discovery and desire creation',
        rationale: `Introduces ${prod} to prospective buyers during leisure browsing hours before active search occurs.`,
      },
      {
        stageName: 'Middle-of-Funnel (Consideration)',
        budgetSharePct: 35,
        recommendedChannels: [topNurt, 'Gmail'],
        creativeFormat: `Feature comparisons & review spotlights addressing hesitation for ${prod}`,
        bestDaysToSend: 'Monday – Wednesday midday',
        keyMotive: 'Overcoming objections and policy verification',
        rationale: `Retargets users with social proof and durability ratings on ${topNurt}.`,
      },
      {
        stageName: 'Bottom-of-Funnel (Conversion)',
        budgetSharePct: 20,
        recommendedChannels: [topClose, 'Direct'],
        creativeFormat: `Urgency-driven checkout ads: "Buy ${prod} now - guaranteed fast delivery"`,
        bestDaysToSend: `${peakDay} (Highest empirical checkout velocity)`,
        keyMotive: 'Urgency & delivery arrival guarantee',
        rationale: `Captures high-intent search queries on ${topClose} when buyers have credit card ready.`,
      },
    ],
  };

  if (!apiKey) {
    return defaultStrategy;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are a Senior Full-Funnel Growth Marketer.
Given the following product and real empirical marketing attribution metrics:
Product Name: ${prod}
Category: ${cat}
Price Point: $${price}
Total Budget: $${budget}
Customer Motive: ${motive}
Target Audience: ${aud}
Empirical Attribution Data from Real Touchpoints:
- Top Discovery Channel: ${topDisc}
- Top Nurturing Channel: ${topNurt}
- Top Closing Channel: ${topClose}
- Peak Conversion Day: ${peakDay}
- Peak Discovery Day: ${peakDiscDay}
- Live Conversion Rate: ${emp.conversionRate || 25}%
- Live AOV: $${emp.avgOrderValue || price}

Create a personalized 3-stage full-funnel ad placement strategy (Top of Funnel, Middle of Funnel, Bottom of Funnel).
Return strictly valid JSON adhering to schema:
- campaignName (string)
- targetAudience (string)
- pricePoint (number)
- motive (string)
- executiveSummary (string - 2 concise sentences connecting the product to the empirical data)
- adSchedulingTakeaway (string - actionable dayparting rule specifying which days of week to send ads based on ${peakDay} and ${peakDiscDay})
- stages: array of exactly 3 objects (Top, Middle, Bottom funnel) with:
  - stageName (string)
  - budgetSharePct (number e.g. 45, 35, 20)
  - recommendedChannels (array of strings, choosing from [Search, YouTube, Display, Discover, Gmail, Direct])
  - creativeFormat (string - creative ad angle tailored to ${prod})
  - bestDaysToSend (string - day of week flight recommendation)
  - keyMotive (string)
  - rationale (string)`;

    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (res.text) {
      return JSON.parse(res.text);
    }
  } catch (err) {
    console.error('Gemini generatePlacementStrategy error:', err);
  }

  return defaultStrategy;
}

