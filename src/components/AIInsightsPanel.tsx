import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  Loader2,
  X,
  CheckCircle2,
  Presentation,
  Download,
  Maximize2,
  GitFork,
} from 'lucide-react';
import { AIInsight, RecommendedAction, DashboardMetrics } from '../types';
import { exportInsightsToSlides, GeneratedSlidePackage, openPresentationInNewTab } from '../utils/slideExport';
import { SlideViewModal } from './SlideViewModal';
import { SlideDestinationModal } from './SlideDestinationModal';

interface AIInsightsPanelProps {
  insights: AIInsight[];
  onGenerateInsights: () => void;
  isLoading: boolean;
  recommendations?: RecommendedAction[];
  metrics?: DashboardMetrics;
  onShowToast?: (msg: string) => void;
  onFilterCohort?: (filterQuery: string, label: string) => void;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  onGenerateInsights,
  isLoading,
  recommendations = [],
  metrics,
  onShowToast,
  onFilterCohort,
}) => {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [slidePreviewInsight, setSlidePreviewInsight] = useState<AIInsight | null>(null);
  const [destinationPackage, setDestinationPackage] = useState<GeneratedSlidePackage | null>(null);
  const [isExportingSlides, setIsExportingSlides] = useState(false);
  const [isExportingSingle, setIsExportingSingle] = useState(false);

  // Icon selector based on category or index
  const getIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <TrendingUp className="w-5 h-5 text-[#1a73e8]" />;
      case 1:
        return <Users className="w-5 h-5 text-[#1a73e8]" />;
      case 2:
      default:
        return <Clock className="w-5 h-5 text-[#1a73e8]" />;
    }
  };

  const handleExportDeck = async () => {
    try {
      setIsExportingSlides(true);
      const pkg = await exportInsightsToSlides({
        insights,
        recommendations,
        metrics,
      });

      // Always open in new tab
      openPresentationInNewTab(pkg);

      // Open destination modal to ask if download to computer or upload to cloud
      setDestinationPackage(pkg);
    } catch (err) {
      console.error('Failed to export slides:', err);
      if (onShowToast) {
        onShowToast('Failed to generate slides. Please try again.');
      }
    } finally {
      setIsExportingSlides(false);
    }
  };

  const handleExportSingleInsight = async (insight: AIInsight) => {
    try {
      setIsExportingSingle(true);
      const pkg = await exportInsightsToSlides({
        insights: [insight],
        singleInsight: insight,
        metrics,
      });

      // Always open in new tab
      openPresentationInNewTab(pkg);

      // Open destination modal to ask if download to computer or upload to cloud
      setDestinationPackage(pkg);
    } catch (err) {
      console.error('Failed to export single insight slide:', err);
      if (onShowToast) {
        onShowToast('Failed to generate slide. Please try again.');
      }
    } finally {
      setIsExportingSingle(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#1a73e8]" />
          <h2 className="text-sm font-semibold text-gray-900">AI Insights</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Generate Slides Button */}
          <button
            type="button"
            onClick={handleExportDeck}
            disabled={isExportingSlides || insights.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#f1f3f4] text-gray-700 hover:bg-[#e8eaed] active:bg-[#dadce0] disabled:opacity-50 transition-colors cursor-pointer"
            title="Export all insights into a formatted PowerPoint presentation slide deck"
          >
            {isExportingSlides ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1a73e8]" />
                <span>Creating Slides...</span>
              </>
            ) : (
              <>
                <Presentation className="w-3.5 h-3.5 text-[#1a73e8]" />
                <span>Generate Slides</span>
              </>
            )}
          </button>

          {/* Generate Insights with Gemini */}
          <button
            type="button"
            onClick={onGenerateInsights}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc] active:bg-[#c2d7fa] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Refresh Insights</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-auto">
        {insights.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-gray-100 bg-[#f8fafd] hover:bg-white hover:border-[#1a73e8]/30 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-full bg-white shadow-2xs border border-gray-100 flex items-center justify-center shrink-0">
                  {getIcon(idx)}
                </div>
                {item.metric && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#e8f0fe] text-[#1a73e8]">
                    {item.metric}
                  </span>
                )}
              </div>

              <h3 className="text-xs font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-2 border-t border-gray-200/60 flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInsight(item)}
                  className="text-xs font-semibold text-[#1a73e8] hover:text-[#174ea6] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {onFilterCohort && (
                  <button
                    type="button"
                    onClick={() => {
                      let q = 'Search';
                      if (item.title.toLowerCase().includes('youtube')) q = 'YouTube';
                      else if (item.title.toLowerCase().includes('display')) q = 'Display';
                      else if (item.title.toLowerCase().includes('search')) q = 'Search';
                      else if (item.title.toLowerCase().includes('gmail') || item.title.toLowerCase().includes('email')) q = 'Gmail';
                      onFilterCohort(q, item.title);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    title="Filter Customer Journeys to this specific cohort"
                  >
                    <GitFork className="w-3 h-3 text-emerald-600" />
                    <span>Filter Cohort</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Expand to Slide View Button */}
                <button
                  type="button"
                  onClick={() => setSlidePreviewInsight(item)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-[#1a73e8] hover:bg-[#e8f0fe] px-2 py-1 rounded-md transition-colors cursor-pointer"
                  title="Expand to Slide View (Full-screen formatted preview)"
                >
                  <Presentation className="w-3.5 h-3.5 text-[#1a73e8]" />
                  <span>Expand to Slide</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Details Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#f8fafd]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1a73e8]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1a73e8]">
                  {selectedInsight.category || 'Strategic Insight'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInsight(null)}
                className="w-7 h-7 rounded-full hover:bg-gray-200/70 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <h4 className="text-base font-bold text-gray-900 leading-snug">
                {selectedInsight.title}
              </h4>

              <div className="p-3 bg-[#e8f0fe]/40 rounded-xl border border-[#1a73e8]/20 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1a73e8] shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Key Metric</div>
                  <div className="text-sm font-bold text-[#1a73e8]">{selectedInsight.metric}</div>
                </div>
              </div>

              <div className="text-xs text-gray-700 leading-relaxed">
                <p>{selectedInsight.description}</p>
                <p className="mt-2 text-gray-500">
                  Synthesized by Gemini from aggregated conversion trends, multi-touch sequence probabilities, and channel attribution share.
                </p>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const ins = selectedInsight;
                  setSelectedInsight(null);
                  setSlidePreviewInsight(ins);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs"
              >
                <Presentation className="w-3.5 h-3.5 text-[#1a73e8]" />
                <span>Expand to Slide View</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedInsight(null)}
                className="px-4 py-2 bg-[#1a73e8] hover:bg-[#174ea6] text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Destination Modal (Download on Computer or Save to Cloud) */}
      <SlideDestinationModal
        isOpen={Boolean(destinationPackage)}
        onClose={() => setDestinationPackage(null)}
        slidePackage={destinationPackage}
        onShowToast={onShowToast}
      />
    </div>
  );
};
