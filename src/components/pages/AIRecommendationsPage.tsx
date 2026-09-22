import React, { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, ArrowRight, Zap, Target, TrendingUp, ShieldAlert, Presentation, Loader2, Maximize2 } from 'lucide-react';
import { AIInsight, RecommendedAction, DashboardMetrics } from '../../types';
import { exportInsightsToSlides, GeneratedSlidePackage, openPresentationInNewTab } from '../../utils/slideExport';
import { SlideViewModal } from '../SlideViewModal';
import { SlideDestinationModal } from '../SlideDestinationModal';

interface AIRecommendationsPageProps {
  insights: AIInsight[];
  recommendations: RecommendedAction[];
  onGenerateInsights: () => void;
  isLoading: boolean;
  metrics?: DashboardMetrics;
  onShowToast?: (msg: string) => void;
}

export const AIRecommendationsPage: React.FC<AIRecommendationsPageProps> = ({
  insights,
  recommendations,
  onGenerateInsights,
  isLoading,
  metrics,
  onShowToast,
}) => {
  const [isExportingSlides, setIsExportingSlides] = useState(false);
  const [slidePreviewInsight, setSlidePreviewInsight] = useState<AIInsight | null>(null);
  const [destinationPackage, setDestinationPackage] = useState<GeneratedSlidePackage | null>(null);

  const handleExportSlides = async () => {
    try {
      setIsExportingSlides(true);
      const pkg = await exportInsightsToSlides({
        insights,
        recommendations,
        metrics,
      });

      // Always open in new tab
      openPresentationInNewTab(pkg);

      // Prompt if they want to download to computer or upload to cloud
      setDestinationPackage(pkg);
    } catch (err) {
      console.error('Failed to export slides:', err);
      if (onShowToast) {
        onShowToast('Failed to export slides. Please try again.');
      }
    } finally {
      setIsExportingSlides(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Recommendations</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/20">
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Machine learning cross-channel attribution intelligence and strategic budget optimization
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Generate Slides Button */}
          <button
            type="button"
            onClick={handleExportSlides}
            disabled={isExportingSlides || insights.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Export insights & recommendations into a professional presentation deck"
          >
            {isExportingSlides ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#1a73e8]" />
                <span>Creating Slides...</span>
              </>
            ) : (
              <>
                <Presentation className="w-4 h-4 text-[#1a73e8]" />
                <span>Generate Slide Deck</span>
              </>
            )}
          </button>

          {/* Refresh Insights Button */}
          <button
            type="button"
            onClick={onGenerateInsights}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing with Gemini...' : 'Generate insights with Gemini'}</span>
          </button>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fef7e0] text-[#b06000] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Algorithmic Journey Discoveries</h2>
              <p className="text-xs text-gray-500">Key drivers synthesized from your 90-day touchpoint history</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#f8fafd] border border-gray-100 hover:border-[#1a73e8]/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[#1a73e8] border border-[#1a73e8]/20">
                    {insight.category}
                  </span>
                  <span className="text-xs font-extrabold text-gray-900">{insight.metric}</span>
                </div>
                <h3 className="text-xs font-bold text-gray-900 leading-snug">{insight.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-gray-200/60 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSlidePreviewInsight(insight)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1a73e8] hover:text-[#174ea6] hover:bg-[#e8f0fe] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  title="Expand to Slide View (Full-screen formatted preview)"
                >
                  <Presentation className="w-3.5 h-3.5" />
                  <span>Expand to Slide View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendations Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Recommended Next Steps</h2>
            <p className="text-xs text-gray-500">Prioritized tactical optimizations based on multi-touch data</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {recommendations.map((rec) => (
            <div key={rec.id} className="py-4 first:pt-2 last:pb-2 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  {rec.id}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-gray-900">{rec.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{rec.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    rec.impact === 'High'
                      ? 'bg-[#fce8e6] text-[#c5221f]'
                      : 'bg-[#fef7e0] text-[#b06000]'
                  }`}
                >
                  {rec.impact} Impact
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                  {rec.timeframe}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-screen Slide View Modal */}
      <SlideViewModal
        isOpen={Boolean(slidePreviewInsight)}
        onClose={() => setSlidePreviewInsight(null)}
        insight={slidePreviewInsight}
        allInsights={insights}
        onSelectInsight={(newInsight) => setSlidePreviewInsight(newInsight)}
        metrics={metrics}
        onShowToast={onShowToast}
      />

      {/* Slide Destination Modal (Download to Computer or Upload to Cloud) */}
      <SlideDestinationModal
        isOpen={Boolean(destinationPackage)}
        onClose={() => setDestinationPackage(null)}
        slidePackage={destinationPackage}
        onShowToast={onShowToast}
      />
    </div>
  );
};
