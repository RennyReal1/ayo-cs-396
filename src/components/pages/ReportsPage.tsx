import React, { useState } from 'react';
import { Download, FileText, Calendar, CheckCircle2, DollarSign, Users, BarChart2, Layers, FileSpreadsheet, Presentation, Loader2 } from 'lucide-react';
import { DashboardMetrics, Touchpoint, AIInsight, RecommendedAction } from '../../types';
import { ChannelIcon } from '../ChannelIcon';
import { downloadCsvTemplate } from '../../utils/dataEngine';
import { exportInsightsToSlides, GeneratedSlidePackage, openPresentationInNewTab } from '../../utils/slideExport';
import { SlideDestinationModal } from '../SlideDestinationModal';

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
    link.setAttribute('download', `P2C_Executive_Summary_${new Date().toISOString().slice(0, 10)}.csv`);
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
      {/* Header with Download Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Executive Reports</h1>
          <p className="text-xs text-gray-500 mt-1">
            Standardized marketing performance summary for reporting period ({metrics.dateRangeLabel})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Generate Slides Button */}
          <button
            type="button"
            onClick={handleExportSlideDeck}
            disabled={isExportingSlides}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Download executive presentation slide deck with insights and metrics"
          >
            {isExportingSlides ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#1a73e8]" />
                <span>Building Slides...</span>
              </>
            ) : (
              <>
                <Presentation className="w-4 h-4 text-[#1a73e8]" />
                <span>Export Presentation (.pptx)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={downloadCsvTemplate}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="Download blank CSV template with example data"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#1a73e8]" />
            <span>Download CSV Template</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Touchpoints CSV</span>
          </button>
        </div>
      </div>

      {/* Key Numbers Summary Cards */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Executive Performance Snapshot</h2>
              <p className="text-xs text-gray-500">Key business outcomes across full-funnel customer journeys</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportSummaryCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafd] hover:bg-[#e8f0fe] border border-gray-200/80 text-gray-700 hover:text-[#1a73e8] rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Summary Table</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl bg-[#f8fafd] border border-gray-100 space-y-1">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Total Users</span>
            <div className="text-lg font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</div>
            <span className="text-[10px] text-gray-500">Unique visitors</span>
          </div>

          <div className="p-4 rounded-xl bg-[#f8fafd] border border-gray-100 space-y-1">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Conversions</span>
            <div className="text-lg font-bold text-gray-900">{metrics.totalConversions.toLocaleString()}</div>
            <span className="text-[10px] text-[#137333] font-semibold">{metrics.conversionRate.toFixed(1)}% conv rate</span>
          </div>

          <div className="p-4 rounded-xl bg-[#f8fafd] border border-gray-100 space-y-1">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Tracked Revenue</span>
            <div className="text-lg font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</div>
            <span className="text-[10px] text-gray-500">From journey paths</span>
          </div>

          <div className="p-4 rounded-xl bg-[#f8fafd] border border-gray-100 space-y-1">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Avg Journey Lag</span>
            <div className="text-lg font-bold text-gray-900">{metrics.avgJourneyLength.toFixed(1)}</div>
            <span className="text-[10px] text-gray-500">Touchpoints per buyer</span>
          </div>

          <div className="p-4 rounded-xl bg-[#f8fafd] border border-gray-100 space-y-1">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Primary Channel</span>
            <div className="text-lg font-bold text-gray-900 truncate">{metrics.topChannel}</div>
            <span className="text-[10px] text-gray-500">{metrics.topChannelShare.toFixed(1)}% of volume</span>
          </div>

          <div className="p-4 rounded-xl bg-[#f8fafd] border border-gray-100 space-y-1">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Dataset Scale</span>
            <div className="text-lg font-bold text-gray-900">{touchpoints.length.toLocaleString()}</div>
            <span className="text-[10px] text-gray-500">Raw log rows</span>
          </div>
        </div>

        {/* Channel Breakdown Breakdown */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Channel Volume Contribution</h3>
          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#f8fafd] text-gray-600 font-semibold">
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Conversions</th>
                  <th className="py-2.5 px-3">Share of Total</th>
                  <th className="py-2.5 px-3">Visual Proportion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.channelContributions.map((c) => (
                  <tr key={c.channel} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <ChannelIcon channel={c.channel} size={18} />
                        <span className="font-semibold text-gray-900">{c.channel}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{c.conversions}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-700">{c.percentage}%</td>
                    <td className="py-2.5 px-3 w-1/3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
