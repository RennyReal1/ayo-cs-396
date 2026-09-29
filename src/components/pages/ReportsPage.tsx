import React, { useState } from 'react';
import {
  Download,
  FileText,
  Calendar,
  CheckCircle2,
  DollarSign,
  Users,
  BarChart2,
  Layers,
  FileSpreadsheet,
  Presentation,
  Loader2,
  History,
} from 'lucide-react';
import { DashboardMetrics, Touchpoint, AIInsight, RecommendedAction } from '../../types';
import { ChannelIcon } from '../ChannelIcon';
import { downloadCsvTemplate } from '../../utils/dataEngine';
import {
  exportInsightsToSlides,
  GeneratedSlidePackage,
  openPresentationInNewTab,
} from '../../utils/slideExport';
import { SlideDestinationModal } from '../SlideDestinationModal';
import { PeriodComparisonCard } from '../PeriodComparisonCard';

interface ReportsPageProps {
  metrics: DashboardMetrics;
  touchpoints: Touchpoint[];
  insights?: AIInsight[];
  recommendations?: RecommendedAction[];
  onExportCsv: () => void;
  onShowToast?: (msg: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  metrics,
  touchpoints,
  insights = [],
  recommendations = [],
  onExportCsv,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'export'>('comparison');
  const [isExportingSlides, setIsExportingSlides] = useState(false);
  const [destinationPackage, setDestinationPackage] = useState<GeneratedSlidePackage | null>(null);

  // Secondary export for executive summary
  const handleExportSummaryCsv = () => {
    const summaryRows = [
      ['Metric', 'Value'],
      ['Reporting Date Range', metrics.dateRangeLabel],
      ['Total Users', metrics.totalUsers],
      ['Total Conversions', metrics.totalConversions],
      ['Conversion Rate (%)', `${metrics.conversionRate.toFixed(1)}%`],
      ['Total Revenue (USD)', `$${metrics.totalRevenue.toLocaleString()}`],
      ['Avg Journey Length (Touchpoints)', metrics.avgJourneyLength.toFixed(1)],
      ['Top Channel', metrics.topChannel],
      ['Top Channel Share (%)', `${metrics.topChannelShare.toFixed(1)}%`],
      ['Total Touchpoints Tracked', touchpoints.length],
      [],
      ['Channel Breakdown'],
      ['Channel', 'Conversions', 'Share (%)'],
      ...metrics.channelContributions.map((c) => [c.channel, c.conversions, `${c.percentage}%`]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      summaryRows.map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `P2C_Executive_Summary_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSlideDeck = async () => {
    try {
      setIsExportingSlides(true);
      const pkg = await exportInsightsToSlides({
        insights,
        recommendations,
        metrics,
      });

      // Always open in new tab
      openPresentationInNewTab(pkg);

      // Prompt if they want to download on computer or upload to cloud
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Reports & Historical Comparisons
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Compare period benchmarks (e.g. Q4 vs. Q3 or monthly snapshots) and export certified attribution reports
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-[#f1f3f4] p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-white text-[#007b83] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Period-over-Period (Q4 vs. Q3)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white text-[#1a73e8] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Executive Exports & Templates</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Period-over-Period Comparison */}
      {activeTab === 'comparison' && (
        <PeriodComparisonCard currentMetrics={metrics} onShowToast={onShowToast} />
      )}

      {/* Tab 2: Standard Executive Exports */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          {/* Export Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Full Dataset CSV */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-[#1a73e8]/30 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Full Touchpoint Raw Data (.csv)
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Export all {touchpoints.length.toLocaleString()} raw interaction events, sequence numbers, timestamps, and conversion values.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onExportCsv}
                className="mt-6 w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Raw CSV
              </button>
            </div>

            {/* 2. Executive Summary CSV */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-[#137333]/30 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Executive Summary (.csv)</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Export high-level metrics, total conversions, conversion rate, revenue, and channel contribution shares for leadership review.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportSummaryCsv}
                className="mt-6 w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-gray-500" />
                Download Summary
              </button>
            </div>

            {/* 3. Starter CSV Template */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-[#b06000]/30 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#fef7e0] text-[#b06000] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Starter CSV Template</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Download an empty template with exact columns (user_id, channel, sequence, converted, value, timestamp) to upload custom data.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={downloadCsvTemplate}
                className="mt-6 w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-gray-500" />
                Download Template
              </button>
            </div>
          </div>

          {/* Presentation Deck Banner */}
          <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40 rounded-2xl border border-blue-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#1a73e8] shadow-xs flex items-center justify-center shrink-0">
                <Presentation className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Google Slides Executive Presentation Deck
                </h3>
                <p className="text-xs text-gray-600 mt-0.5 max-w-xl">
                  Automatically synthesize all findings, attribution models, channel contributions, and Gemini insights into a multi-slide presentation deck.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportSlideDeck}
              disabled={isExportingSlides}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isExportingSlides ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Slides...</span>
                </>
              ) : (
                <>
                  <Presentation className="w-4 h-4" />
                  <span>Generate Slides Deck</span>
                </>
              )}
            </button>
          </div>
        </div>
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
