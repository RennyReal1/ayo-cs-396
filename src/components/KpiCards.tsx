import React from 'react';
import { Users, BarChart2, Share2, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DashboardMetrics } from '../types';

interface KpiCardsProps {
  metrics: DashboardMetrics;
  isCustomScale?: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  // Format numbers nicely
  const formattedConversions = metrics.totalConversions.toLocaleString();
  const formattedRate = `${metrics.conversionRate.toFixed(1)}%`;
  const formattedJourney = `${metrics.avgJourneyLength.toFixed(1)} touchpoints`;
  const topChannel = metrics.topChannel;
  const topShare = `${metrics.topChannelShare.toFixed(0)}% of total conversions`;

  const prev = metrics.previousPeriodChanges;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Conversions */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow min-h-[120px]">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500">Total Conversions</span>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              {formattedConversions}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {prev && prev.conversionsPct !== null ? (
          <div className="mt-4 flex items-center gap-1.5 text-xs">
            <span
              className={`flex items-center font-semibold ${
                prev.conversionsPct >= 0 ? 'text-[#137333]' : 'text-[#c5221f]'
              }`}
            >
              {prev.conversionsPct >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(prev.conversionsPct).toFixed(1)}%
            </span>
            <span className="text-gray-400">vs. previous period</span>
          </div>
        ) : null}
      </div>

      {/* 2. Conversion Rate */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow min-h-[120px]">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500">Conversion Rate</span>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              {formattedRate}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>

        {prev && prev.conversionRateDelta !== null ? (
          <div className="mt-4 flex items-center gap-1.5 text-xs">
            <span
              className={`flex items-center font-semibold ${
                prev.conversionRateDelta >= 0 ? 'text-[#137333]' : 'text-[#c5221f]'
              }`}
            >
              {prev.conversionRateDelta >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(prev.conversionRateDelta).toFixed(1)}%
            </span>
            <span className="text-gray-400">vs. previous period</span>
          </div>
        ) : null}
      </div>

      {/* 3. Avg. Journey Length */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow min-h-[120px]">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500">Avg. Journey Length</span>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              {formattedJourney}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
        </div>

        {prev && prev.journeyLengthPct !== null ? (
          <div className="mt-4 flex items-center gap-1.5 text-xs">
            <span
              className={`flex items-center font-semibold ${
                prev.journeyLengthPct <= 0 ? 'text-[#137333]' : 'text-[#c5221f]'
              }`}
            >
              {prev.journeyLengthPct <= 0 ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(prev.journeyLengthPct).toFixed(1)}%
            </span>
            <span className="text-gray-400">vs. previous period</span>
          </div>
        ) : null}
      </div>

      {/* 4. Top Performing Channel */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow min-h-[120px]">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500">Top Performing Channel</span>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              {topChannel}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 text-xs">
          <span className="font-semibold text-gray-900">{topShare}</span>
        </div>
      </div>
    </div>
  );
};

