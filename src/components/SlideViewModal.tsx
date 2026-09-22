import React, { useState } from 'react';
import {
  X,
  Download,
  Presentation,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Share2,
} from 'lucide-react';
import { AIInsight, DashboardMetrics } from '../types';
import { exportInsightsToSlides, GeneratedSlidePackage, openPresentationInNewTab } from '../utils/slideExport';
import { SlideDestinationModal } from './SlideDestinationModal';

interface SlideViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: AIInsight | null;
  allInsights?: AIInsight[];
  onSelectInsight?: (insight: AIInsight) => void;
  metrics?: DashboardMetrics;
  onShowToast?: (msg: string) => void;
}

export const SlideViewModal: React.FC<SlideViewModalProps> = ({
  isOpen,
  onClose,
  insight,
  allInsights = [],
  onSelectInsight,
  metrics,
  onShowToast,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [destinationPackage, setDestinationPackage] = useState<GeneratedSlidePackage | null>(null);

  if (!isOpen || !insight) return null;

  const currentIndex = allInsights.findIndex((i) => i.title === insight.title);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < allInsights.length - 1;

  const handlePrev = () => {
    if (hasPrev && onSelectInsight) {
      onSelectInsight(allInsights[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectInsight) {
      onSelectInsight(allInsights[currentIndex + 1]);
    }
  };

  const handleExportThisSlide = async () => {
    try {
      setIsExporting(true);
      const pkg = await exportInsightsToSlides({
        insights: [insight],
        singleInsight: insight,
        metrics,
      });

      // Always open in new tab
      openPresentationInNewTab(pkg);

      // Ask if they want to download on computer or upload to cloud
      setDestinationPackage(pkg);
    } catch (err) {
      console.error('Failed to export slide:', err);
      if (onShowToast) {
        onShowToast('Failed to prepare slide presentation.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      id="slide-preview-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between px-4 py-2.5 text-white mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1a73e8] text-white flex items-center justify-center shadow-xs">
            <Presentation className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-200">Executive Slide Presentation Preview</div>
            <div className="text-[11px] text-gray-400">
              Formatted 16:9 widescreen presentation slide
              {allInsights.length > 0 && currentIndex !== -1 ? ` (${currentIndex + 1} of ${allInsights.length})` : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Previous / Next buttons */}
          {allInsights.length > 1 && (
            <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10 mr-1">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1.5 text-gray-300 hover:text-white disabled:opacity-30 disabled:hover:text-gray-300 rounded cursor-pointer transition-colors"
                title="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] px-2 text-gray-300 font-mono">
                {currentIndex + 1} / {allInsights.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1.5 text-gray-300 hover:text-white disabled:opacity-30 disabled:hover:text-gray-300 rounded cursor-pointer transition-colors"
                title="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Toggle Fullscreen / Maximize */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Slide'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download PPTX Slide Button */}
          <button
            type="button"
            onClick={handleExportThisSlide}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Slide (.pptx)</span>
              </>
            )}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white border border-white/10 transition-colors cursor-pointer ml-1"
            title="Close Preview (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The 16:9 Slide Canvas Container */}
      <div
        className={`w-full transition-all duration-200 flex items-center justify-center ${
          isFullscreen ? 'max-w-[96vw] max-h-[90vh]' : 'max-w-5xl max-h-[82vh]'
        }`}
      >
        <div
          id="slide-preview-card"
          className="w-full aspect-[16/9] bg-[#f8fafd] rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col justify-between relative select-text"
        >
          {/* Top Brand Accent Stripe */}
          <div className="h-1.5 bg-[#1a73e8] w-full shrink-0" />

          {/* Slide Header Area */}
          <div className="px-6 sm:px-10 pt-5 sm:pt-7 pb-3 flex items-start justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                  {insight.category || 'Strategic Journey Discovery'}
                </span>
                <span className="text-xs font-medium text-gray-400">·</span>
                <span className="text-xs text-gray-500 font-medium">Algorithmic Insight</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#202124] tracking-tight leading-snug">
                {insight.title}
              </h1>
            </div>

            <div className="shrink-0 text-right hidden sm:block">
              <div className="text-xs font-bold text-gray-900 tracking-wider">Google Mira</div>
              <div className="text-[10px] text-gray-400 font-medium">Path to Conversion Insights</div>
            </div>
          </div>

          {/* Slide Content Body (Two Columns matching the PPTX layout) */}
          <div className="px-6 sm:px-10 py-3 grid grid-cols-12 gap-4 sm:gap-6 flex-1 items-stretch">
            {/* Left Column: Key Metric Lift Box */}
            <div className="col-span-12 sm:col-span-4 bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Key Metric Impact
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1a73e8] tracking-tight leading-none my-2">
                  {insight.metric || 'High Impact'}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Observed conversion multiplier across verified multi-touch interaction paths.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="p-3 bg-[#e8f0fe] rounded-xl border border-[#d2e3fc]">
                  <div className="text-[10px] font-bold text-[#174ea6] uppercase tracking-wider">
                    Target Channel Synergy
                  </div>
                  <div className="text-xs font-bold text-gray-900 mt-0.5">
                    {insight.category || 'Multi-Touch Acceleration'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative Analysis & Executive Guidance */}
            <div className="col-span-12 sm:col-span-8 bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="w-4 h-4 text-[#1a73e8]" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Strategic Analysis &amp; Findings
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                  {insight.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-[11px] font-bold text-[#1a73e8] uppercase tracking-wider mb-2">
                  Executive Implementation Guidance
                </div>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#1a73e8] font-bold">•</span>
                    <span>Coordinate automated cross-channel bids to prioritize users demonstrating this multi-touch path.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1a73e8] font-bold">•</span>
                    <span>Re-allocate top-of-funnel impression caps to sustain velocity into mid-funnel retargeting.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1a73e8] font-bold">•</span>
                    <span>Monitor conversion lag and calibrate weekly spend adjustments in the Attribution comparison model.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Slide Footer */}
          <div className="px-6 sm:px-10 py-3 sm:py-4 border-t border-gray-200/80 bg-white flex items-center justify-between text-[11px] text-gray-500 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Synthesized with Gemini 2.5</span>
              <span>·</span>
              <span>Data source: Multi-Touch Attribution Records</span>
              <span>·</span>
              <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>

            <div className="font-mono text-xs text-gray-400">
              Slide {currentIndex !== -1 ? currentIndex + 1 : 1} of {allInsights.length || 1}
            </div>
          </div>
        </div>
      </div>

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
