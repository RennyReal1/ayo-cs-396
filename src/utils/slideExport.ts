import pptxgen from 'pptxgenjs';
import { AIInsight, RecommendedAction, DashboardMetrics } from '../types';

export interface GeneratedSlidePackage {
  blob: Blob;
  fileName: string;
  title: string;
  slideCount: number;
  previewHtml?: string;
}

export interface SlideExportOptions {
  insights: AIInsight[];
  recommendations?: RecommendedAction[];
  metrics?: DashboardMetrics;
  singleInsight?: AIInsight;
}

export function downloadBlobFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function openPresentationInNewTab(pkg: GeneratedSlidePackage) {
  const newTab = window.open('', '_blank');
  if (!newTab) {
    console.warn('Popup blocked, falling back to download');
    downloadBlobFile(pkg.blob, pkg.fileName);
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pkg.title} - Google Mira Presentation</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body class="bg-[#202124] text-white min-h-screen flex flex-col justify-between">
  <!-- Top Navigation Bar -->
  <header class="h-16 px-6 bg-[#2d2e30] border-b border-gray-700/60 flex items-center justify-between shadow-md">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-[#1a73e8] text-white flex items-center justify-center font-bold text-sm">
        P2C
      </div>
      <div>
        <h1 class="text-sm font-bold text-white tracking-wide">${pkg.title}</h1>
        <p class="text-xs text-gray-400 font-mono">${pkg.fileName} &middot; ${pkg.slideCount} ${pkg.slideCount === 1 ? 'Slide' : 'Slides'}</p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button id="downloadBtn" class="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        <span>Download .pptx</span>
      </button>
    </div>
  </header>

  <!-- Slide Canvas Viewport -->
  <main class="flex-1 flex items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-5xl aspect-[16/9] bg-[#f8fafd] text-[#202124] rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col justify-between relative">
      <!-- Google Color Stripe -->
      <div class="h-2 bg-[#1a73e8] w-full"></div>

      <!-- Slide Header -->
      <div class="p-8 pb-4 flex items-start justify-between">
        <div class="space-y-1">
          <div class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#e8f0fe] text-[#1a73e8]">
            Executive AI Insights
          </div>
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mt-2">${pkg.title}</h2>
        </div>
        <div class="text-right">
          <div class="text-xs font-bold text-gray-900">Google Mira</div>
          <div class="text-[10px] text-gray-500 font-medium">Path to Conversion Insights</div>
        </div>
      </div>

      <!-- Slide Body Presentation -->
      <div class="px-8 py-4 flex-1 flex flex-col justify-center">
        <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Multi-Touch Attribution Presentation</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#137333]">Ready for Keynote / PowerPoint / Google Slides</span>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed">
            This slide deck contains synthesized machine learning discoveries across user journey paths, touchpoint sequences, and ROI attribution shifts.
          </p>
          <div class="grid grid-cols-3 gap-3 pt-2 text-xs">
            <div class="p-3 bg-[#f8fafd] rounded-lg border border-gray-200">
              <span class="text-gray-500 block text-[10px] uppercase font-bold">Slide Deck Format</span>
              <span class="font-bold text-gray-900 text-sm">16:9 Widescreen</span>
            </div>
            <div class="p-3 bg-[#f8fafd] rounded-lg border border-gray-200">
              <span class="text-gray-500 block text-[10px] uppercase font-bold">Total Slides</span>
              <span class="font-bold text-[#1a73e8] text-sm">${pkg.slideCount} Slides</span>
            </div>
            <div class="p-3 bg-[#f8fafd] rounded-lg border border-gray-200">
              <span class="text-gray-500 block text-[10px] uppercase font-bold">Model Engine</span>
              <span class="font-bold text-gray-900 text-sm">Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide Footer -->
      <div class="px-8 py-4 border-t border-gray-200 bg-white flex items-center justify-between text-xs text-gray-500">
        <div>Google Mira Presentation &middot; Marketing Analytics Intelligence</div>
        <div class="font-mono">Slide 1 of ${pkg.slideCount}</div>
      </div>
    </div>
  </main>

  <footer class="h-10 px-6 bg-[#2d2e30] border-t border-gray-700/60 flex items-center justify-center text-xs text-gray-400">
    Tip: Click "Download .pptx" to open in Microsoft PowerPoint or upload into Google Drive / Google Slides.
  </footer>

  <script>
    const blobUrl = "${URL.createObjectURL(pkg.blob)}";
    const fileName = "${pkg.fileName}";
    document.getElementById('downloadBtn').addEventListener('click', function() {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  </script>
</body>
</html>
  `;

  newTab.document.write(html);
  newTab.document.close();
}

export async function exportInsightsToSlides({
  insights,
  recommendations = [],
  metrics,
  singleInsight,
}: SlideExportOptions): Promise<GeneratedSlidePackage> {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Google Mira (Path to Conversion Insights)';
  pres.company = 'Marketing Attribution Intelligence';
  pres.title = singleInsight ? `Insight - ${singleInsight.title}` : 'Executive Marketing Attribution & Conversion Insights';

  // Define Google-branded Theme Colors
  const GOOGLE_BLUE = '1A73E8';
  const GOOGLE_DARK_BLUE = '174EA6';
  const GOOGLE_BG = 'F8FAFD';
  const TEXT_DARK = '202124';
  const TEXT_MUTED = '5F6368';
  const BORDER_LIGHT = 'DADCE0';
  const CARD_BG = 'FFFFFF';
  const PILL_BG = 'E8F0FE';

  // Helper: Header bar on content slides
  const addHeader = (slide: pptxgen.Slide, titleText: string, categoryBadge: string = 'AI INSIGHTS') => {
    // Top background accent strip
    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.1,
      fill: { color: GOOGLE_BLUE },
      line: { color: GOOGLE_BLUE },
    });

    // Category Badge
    slide.addText(categoryBadge.toUpperCase(), {
      x: 0.8,
      y: 0.45,
      w: 8.0,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: GOOGLE_BLUE,
      fontFace: 'Arial',
    });

    // Main Slide Title
    slide.addText(titleText, {
      x: 0.8,
      y: 0.75,
      w: 11.5,
      h: 0.65,
      fontSize: 22,
      bold: true,
      color: TEXT_DARK,
      fontFace: 'Arial',
    });

    // Top Right Brand Tag
    slide.addText('Google Mira | P2C', {
      x: 10.5,
      y: 0.45,
      w: 2.2,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: TEXT_MUTED,
      align: 'right',
      fontFace: 'Arial',
    });
  };

  // Helper: Slide Footer
  const addFooter = (slide: pptxgen.Slide, slideNum: number, totalSlides: number) => {
    slide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 7.0,
      w: 11.73,
      h: 0,
      line: { color: BORDER_LIGHT, width: 1 },
    });

    slide.addText(
      `Generated from multi-touch attribution history & Gemini 2.5 intelligence | Date: ${new Date().toLocaleDateString()}`,
      {
        x: 0.8,
        y: 7.05,
        w: 9.0,
        h: 0.3,
        fontSize: 9,
        color: TEXT_MUTED,
        fontFace: 'Arial',
      }
    );

    slide.addText(`Slide ${slideNum} of ${totalSlides}`, {
      x: 10.5,
      y: 7.05,
      w: 2.0,
      h: 0.3,
      fontSize: 9,
      color: TEXT_MUTED,
      align: 'right',
      fontFace: 'Arial',
    });
  };

  // If exporting a single insight
  if (singleInsight) {
    const slide = pres.addSlide();
    slide.background = { color: GOOGLE_BG };
    addHeader(slide, singleInsight.title, singleInsight.category || 'Strategic Journey Discovery');

    // Left Box: Key Metric Callout
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.6,
      w: 3.5,
      h: 5.1,
      rectRadius: 0.15,
      fill: { color: CARD_BG },
      line: { color: BORDER_LIGHT, width: 1 },
    });

    slide.addText('KEY METRIC LIFT', {
      x: 1.1,
      y: 2.0,
      w: 2.9,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: TEXT_MUTED,
      fontFace: 'Arial',
    });

    slide.addText(singleInsight.metric || 'High Impact', {
      x: 1.1,
      y: 2.4,
      w: 2.9,
      h: 1.0,
      fontSize: 34,
      bold: true,
      color: GOOGLE_BLUE,
      fontFace: 'Arial',
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.1,
      y: 3.6,
      w: 2.9,
      h: 1.2,
      rectRadius: 0.1,
      fill: { color: PILL_BG },
      line: { color: 'D2E3FC', width: 1 },
    });

    slide.addText('Category Focus', {
      x: 1.25,
      y: 3.75,
      w: 2.6,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: TEXT_MUTED,
      fontFace: 'Arial',
    });

    slide.addText(singleInsight.category || 'Channel Synergy', {
      x: 1.25,
      y: 4.05,
      w: 2.6,
      h: 0.5,
      fontSize: 13,
      bold: true,
      color: GOOGLE_DARK_BLUE,
      fontFace: 'Arial',
    });

    // Right Box: Detailed Narrative & Recommendations
    slide.addShape(pres.ShapeType.roundRect, {
      x: 4.6,
      y: 1.6,
      w: 7.9,
      h: 5.1,
      rectRadius: 0.15,
      fill: { color: CARD_BG },
      line: { color: BORDER_LIGHT, width: 1 },
    });

    slide.addText('Strategic Analysis', {
      x: 5.0,
      y: 1.9,
      w: 7.1,
      h: 0.4,
      fontSize: 15,
      bold: true,
      color: TEXT_DARK,
      fontFace: 'Arial',
    });

    slide.addText(singleInsight.description, {
      x: 5.0,
      y: 2.4,
      w: 7.1,
      h: 2.0,
      fontSize: 13,
      lineSpacingMultiple: 1.3,
      color: TEXT_DARK,
      fontFace: 'Arial',
    });

    slide.addShape(pres.ShapeType.line, {
      x: 5.0,
      y: 4.6,
      w: 7.1,
      h: 0,
      line: { color: BORDER_LIGHT, width: 1 },
    });

    slide.addText('Executive Implementation Guidance', {
      x: 5.0,
      y: 4.8,
      w: 7.1,
      h: 0.35,
      fontSize: 12,
      bold: true,
      color: GOOGLE_BLUE,
      fontFace: 'Arial',
    });

    slide.addText(
      '• Coordinate automated cross-channel bids to prioritize users demonstrating this multi-touch path.\n• Re-allocate top-of-funnel impression caps to sustain velocity into mid-funnel retargeting.\n• Monitor conversion lag and calibrate weekly spend adjustments in the Attribution comparison model.',
      {
        x: 5.0,
        y: 5.2,
        w: 7.1,
        h: 1.2,
        fontSize: 11,
        color: TEXT_MUTED,
        bullet: true,
        lineSpacingMultiple: 1.2,
        fontFace: 'Arial',
      }
    );

    addFooter(slide, 1, 1);
    const fileName = `P2C_Insight_${singleInsight.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.pptx`;
    const blobResult = (await pres.write({ outputType: 'blob' })) as Blob;
    return {
      blob: blobResult,
      fileName,
      title: singleInsight.title,
      slideCount: 1,
    };
  }

  // Multi-Slide Deck Export
  const totalSlides = 1 + Math.ceil(insights.length / 3) + (recommendations.length > 0 ? 1 : 0);
  let currentSlideNum = 1;

  // --- SLIDE 1: Title & Executive Summary ---
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: GOOGLE_BG };

  // Decorative top gradient line
  titleSlide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.12,
    fill: { color: GOOGLE_BLUE },
    line: { color: GOOGLE_BLUE },
  });

  titleSlide.addText('GOOGLE MIRA | PATH TO CONVERSION INSIGHTS', {
    x: 1.0,
    y: 1.5,
    w: 11.0,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: GOOGLE_BLUE,
    fontFace: 'Arial',
  });

  titleSlide.addText('Marketing Attribution & Journey Insights', {
    x: 1.0,
    y: 1.9,
    w: 11.3,
    h: 1.2,
    fontSize: 32,
    bold: true,
    color: TEXT_DARK,
    fontFace: 'Arial',
  });

  titleSlide.addText(
    `Executive briefing on full-funnel customer interaction touchpoints, channel attribution models, and algorithmic recommendations synthesized with Gemini AI.`,
    {
      x: 1.0,
      y: 3.1,
      w: 10.0,
      h: 0.8,
      fontSize: 13,
      color: TEXT_MUTED,
      fontFace: 'Arial',
    }
  );

  // 3 KPI overview cards on title slide if metrics provided
  if (metrics) {
    const kpis = [
      { label: 'Total Conversions', val: metrics.totalConversions.toLocaleString(), note: `${metrics.conversionRate.toFixed(1)}% Conv Rate` },
      { label: 'Total Tracked Revenue', val: `$${metrics.totalRevenue.toLocaleString()}`, note: `${metrics.totalUsers.toLocaleString()} Visitors` },
      { label: 'Avg Journey Length', val: `${metrics.avgJourneyLength.toFixed(1)} steps`, note: `Top Channel: ${metrics.topChannel}` },
    ];

    kpis.forEach((kpi, i) => {
      const cardX = 1.0 + i * 3.8;
      titleSlide.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: 4.2,
        w: 3.5,
        h: 2.0,
        rectRadius: 0.15,
        fill: { color: CARD_BG },
        line: { color: BORDER_LIGHT, width: 1 },
      });

      titleSlide.addText(kpi.label.toUpperCase(), {
        x: cardX + 0.3,
        y: 4.45,
        w: 2.9,
        h: 0.3,
        fontSize: 10,
        bold: true,
        color: TEXT_MUTED,
        fontFace: 'Arial',
      });

      titleSlide.addText(kpi.val, {
        x: cardX + 0.3,
        y: 4.8,
        w: 2.9,
        h: 0.6,
        fontSize: 24,
        bold: true,
        color: GOOGLE_BLUE,
        fontFace: 'Arial',
      });

      titleSlide.addText(kpi.note, {
        x: cardX + 0.3,
        y: 5.5,
        w: 2.9,
        h: 0.35,
        fontSize: 10,
        color: TEXT_MUTED,
        fontFace: 'Arial',
      });
    });
  }

  addFooter(titleSlide, currentSlideNum++, totalSlides);

  // --- SLIDE 2+: AI Insights Cards ---
  const insightSlide = pres.addSlide();
  insightSlide.background = { color: GOOGLE_BG };
  addHeader(insightSlide, 'Key Algorithmic Discoveries & Synergies', 'Executive AI Insights');

  // Render cards for insights (up to 3 per slide)
  insights.slice(0, 3).forEach((item, idx) => {
    const cardX = 0.8 + idx * 3.95;
    const cardY = 1.6;
    const cardW = 3.8;
    const cardH = 5.0;

    insightSlide.addShape(pres.ShapeType.roundRect, {
      x: cardX,
      y: cardY,
      w: cardW,
      h: cardH,
      rectRadius: 0.15,
      fill: { color: CARD_BG },
      line: { color: BORDER_LIGHT, width: 1 },
    });

    // Category Pill
    insightSlide.addShape(pres.ShapeType.roundRect, {
      x: cardX + 0.3,
      y: cardY + 0.35,
      w: 2.0,
      h: 0.35,
      rectRadius: 0.08,
      fill: { color: PILL_BG },
      line: { color: 'D2E3FC', width: 0.5 },
    });

    insightSlide.addText(item.category || 'Strategic Insight', {
      x: cardX + 0.35,
      y: cardY + 0.4,
      w: 1.9,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: GOOGLE_DARK_BLUE,
      fontFace: 'Arial',
    });

    // Metric Callout
    if (item.metric) {
      insightSlide.addText(item.metric, {
        x: cardX + cardW - 1.5,
        y: cardY + 0.35,
        w: 1.2,
        h: 0.35,
        fontSize: 10,
        bold: true,
        color: GOOGLE_BLUE,
        align: 'right',
        fontFace: 'Arial',
      });
    }

    // Title
    insightSlide.addText(item.title, {
      x: cardX + 0.3,
      y: cardY + 0.9,
      w: cardW - 0.6,
      h: 0.9,
      fontSize: 13,
      bold: true,
      color: TEXT_DARK,
      fontFace: 'Arial',
    });

    // Divider
    insightSlide.addShape(pres.ShapeType.line, {
      x: cardX + 0.3,
      y: cardY + 1.9,
      w: cardW - 0.6,
      h: 0,
      line: { color: BORDER_LIGHT, width: 1 },
    });

    // Description
    insightSlide.addText(item.description, {
      x: cardX + 0.3,
      y: cardY + 2.1,
      w: cardW - 0.6,
      h: 2.5,
      fontSize: 11,
      color: TEXT_MUTED,
      lineSpacingMultiple: 1.25,
      fontFace: 'Arial',
    });
  });

  addFooter(insightSlide, currentSlideNum++, totalSlides);

  // --- SLIDE 3: Recommended Action Plan ---
  if (recommendations && recommendations.length > 0) {
    const actionSlide = pres.addSlide();
    actionSlide.background = { color: GOOGLE_BG };
    addHeader(actionSlide, 'Strategic Marketing Action Plan', 'Gemini Recommendations');

    recommendations.slice(0, 4).forEach((rec, idx) => {
      const rowY = 1.6 + idx * 1.25;

      actionSlide.addShape(pres.ShapeType.roundRect, {
        x: 0.8,
        y: rowY,
        w: 11.73,
        h: 1.1,
        rectRadius: 0.12,
        fill: { color: CARD_BG },
        line: { color: BORDER_LIGHT, width: 1 },
      });

      // Step Number Pill
      actionSlide.addShape(pres.ShapeType.ellipse, {
        x: 1.1,
        y: rowY + 0.3,
        w: 0.5,
        h: 0.5,
        fill: { color: GOOGLE_BLUE },
        line: { color: GOOGLE_BLUE },
      });

      actionSlide.addText(`${rec.id || idx + 1}`, {
        x: 1.1,
        y: rowY + 0.3,
        w: 0.5,
        h: 0.5,
        fontSize: 12,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        fontFace: 'Arial',
      });

      // Title and Description
      actionSlide.addText(rec.title, {
        x: 1.8,
        y: rowY + 0.18,
        w: 7.5,
        h: 0.35,
        fontSize: 12,
        bold: true,
        color: TEXT_DARK,
        fontFace: 'Arial',
      });

      actionSlide.addText(rec.description, {
        x: 1.8,
        y: rowY + 0.55,
        w: 7.5,
        h: 0.45,
        fontSize: 10,
        color: TEXT_MUTED,
        fontFace: 'Arial',
      });

      // Impact Tag
      actionSlide.addShape(pres.ShapeType.roundRect, {
        x: 9.6,
        y: rowY + 0.35,
        w: 1.3,
        h: 0.4,
        rectRadius: 0.08,
        fill: { color: rec.impact === 'High' ? 'FCE8E6' : 'FEF7E0' },
        line: { color: rec.impact === 'High' ? 'FAD2CF' : 'FEEFC3', width: 1 },
      });

      actionSlide.addText(`${rec.impact} Impact`, {
        x: 9.6,
        y: rowY + 0.4,
        w: 1.3,
        h: 0.3,
        fontSize: 9,
        bold: true,
        color: rec.impact === 'High' ? 'C5221F' : 'B06000',
        align: 'center',
        fontFace: 'Arial',
      });

      // Timeframe Tag
      actionSlide.addText(rec.timeframe || 'Immediate', {
        x: 11.0,
        y: rowY + 0.4,
        w: 1.4,
        h: 0.3,
        fontSize: 9,
        bold: true,
        color: TEXT_MUTED,
        align: 'center',
        fontFace: 'Arial',
      });
    });

    addFooter(actionSlide, currentSlideNum++, totalSlides);
  }

  // Generate the PPTX presentation blob
  const fileName = `P2C_Marketing_Insights_Deck_${new Date().toISOString().slice(0, 10)}.pptx`;
  const blobResult = (await pres.write({ outputType: 'blob' })) as Blob;

  return {
    blob: blobResult,
    fileName,
    title: 'Executive Marketing Attribution & Conversion Insights',
    slideCount: totalSlides,
  };
}
