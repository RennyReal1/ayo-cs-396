import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  ShieldAlert,
  Presentation,
  Loader2,
  Maximize2,
  Layers,
  Compass,
} from 'lucide-react';
import { AIInsight, RecommendedAction, DashboardMetrics, Touchpoint } from '../../types';
import {
  exportInsightsToSlides,
  GeneratedSlidePackage,
  openPresentationInNewTab,
} from '../../utils/slideExport';
import { SlideViewModal } from '../SlideViewModal';
import { SlideDestinationModal } from '../SlideDestinationModal';
import { CampaignPlacementAdvisor } from '../CampaignPlacementAdvisor';

interface AIRecommendationsPageProps {
  insights: AIInsight[];
  recommendations: RecommendedAction[];
  onGenerateInsights: () => void;
  isLoading: boolean;
  metrics: DashboardMetrics;
  touchpoints: Touchpoint[];
  onShowToast?: (msg: string) => void;
}

export const AIRecommendationsPage: React.FC<AIRecommendationsPageProps> = ({
  insights,
  recommendations,
  onGenerateInsights,
  isLoading,
  metrics,
  touchpoints,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'advisor' | 'gemini'>('advisor');
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

      // Open presentation in new tab
      openPresentationInNewTab(pkg);

      // Prompt cloud upload or download
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
      {/* Header with Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              AI Recommendations & Placement Advisor
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/20">
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Machine learning cross-channel attribution intelligence, full-funnel ad placement blueprints, and tactical budget flighting
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-[#f1f3f4] p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'advisor'
                ? 'bg-white text-[#9334e8] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Ad Placement Advisor (e.g. Coachella)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'gemini'
                ? 'bg-white text-[#1a73e8] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Insights & Slides</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Campaign Placement Advisor */}
      {activeTab === 'advisor' && (
        <CampaignPlacementAdvisor
          touchpoints={touchpoints}
          metrics={metrics}
          onShowToast={onShowToast}
        />
      )}

      {/* Tab 2: Gemini Synthesis & Slides Deck */}
      {activeTab === 'gemini' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3">
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

            <button
              type="button"
              onClick={onGenerateInsights}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {isLoading ? 'Synthesizing with Gemini...' : 'Generate insights with Gemini'}
              </span>
            </button>
          </div>

          {/* AI Insights Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#fef7e0] text-[#b06000] flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Algorithmic Journey Discoveries
                  </h2>
                  <p className="text-xs text-gray-500">
                    Key drivers synthesized from your 90-day touchpoint history
                  </p>
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
                      <span className="text-xs font-extrabold text-gray-900">
                        {insight.metric}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{insight.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-200/60 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> High Confidence
                    </span>
                    <button
                      type="button"
                      onClick={() => setSlidePreviewInsight(insight)}
                      className="text-[11px] font-semibold text-[#1a73e8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Preview Slide
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Actions Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Prescriptive Recommendations
                </h2>
                <p className="text-xs text-gray-500">
                  Prioritized actions to eliminate attribution waste and optimize cross-channel budget flighting
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-gray-200/70 hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-[#1a73e8] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {rec.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-gray-900">{rec.title}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.impact === 'High'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {rec.impact} Impact
                        </span>
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {rec.timeframe}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#1a73e8] bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Apply Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slide Preview Modal */}
      {slidePreviewInsight && (
        <SlideViewModal
          insight={slidePreviewInsight}
          onClose={() => setSlidePreviewInsight(null)}
        />
      )}

      {/* Slide Destination Modal */}
      {destinationPackage && (
        <SlideDestinationModal
          pkg={destinationPackage}
          onClose={() => setDestinationPackage(null)}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
