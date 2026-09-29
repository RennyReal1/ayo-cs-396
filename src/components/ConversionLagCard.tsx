import React, { useState, useMemo } from 'react';
import {
  Clock,
  Zap,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { UserJourney, ChannelName } from '../types';
import { computeConversionLagMetrics } from '../utils/dataEngine';
import { ChannelIcon } from './ChannelIcon';

interface ConversionLagCardProps {
  journeys: UserJourney[];
  onFilterByBucket?: (bucketId: string | null) => void;
  selectedBucketId?: string | null;
}

export const ConversionLagCard: React.FC<ConversionLagCardProps> = ({
  journeys,
  onFilterByBucket,
  selectedBucketId,
}) => {
  const [internalBucketId, setInternalBucketId] = useState<string | null>(null);
  const activeBucketId = selectedBucketId !== undefined ? selectedBucketId : internalBucketId;

  const lagMetrics = useMemo(() => {
    return computeConversionLagMetrics(journeys);
  }, [journeys]);

  const handleBucketClick = (id: string) => {
    const next = activeBucketId === id ? null : id;
    setInternalBucketId(next);
    onFilterByBucket?.(next);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-amber-50/60 via-orange-50/40 to-white rounded-2xl border border-amber-200/60 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#b06000] text-white">
                <Clock className="w-3.5 h-3.5" />
                Sales Cycle Velocity
              </span>
              <span className="text-xs font-semibold text-gray-500">
                First-Touch to Final Sale Lag
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1.5">
              Time to Convert (Conversion Latency Analysis)
            </h2>
            <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
              Understand how many days pass between a customer's first ad exposure and final checkout. Optimize retargeting windows, ad flighting, and email cadence.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-amber-100 shadow-2xs self-start md:self-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Overall Average</p>
              <p className="text-2xl font-black text-gray-900 leading-tight">
                {lagMetrics.overallAvgDays}{' '}
                <span className="text-xs font-medium text-gray-500">days</span>
              </p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Median Time</p>
              <p className="text-2xl font-black text-[#1a73e8] leading-tight">
                {lagMetrics.medianDays}{' '}
                <span className="text-xs font-medium text-gray-500">days</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Fastest Converting Channel</p>
            <div className="flex items-center gap-2 mt-1">
              <ChannelIcon channel={lagMetrics.fastestChannel} size={22} />
              <p className="text-lg font-bold text-gray-900">{lagMetrics.fastestChannel}</p>
            </div>
            <p className="text-[11px] text-[#137333] font-medium mt-1">
              Shortest time from discovery to checkout
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#137333] flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Longest Consideration Channel</p>
            <div className="flex items-center gap-2 mt-1">
              <ChannelIcon channel={lagMetrics.longestChannel} size={22} />
              <p className="text-lg font-bold text-gray-900">{lagMetrics.longestChannel}</p>
            </div>
            <p className="text-[11px] text-[#b06000] font-medium mt-1">
              Requires multi-touch nurturing window
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-[#b06000] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Same-Day Checkouts (&lt; 24h)</p>
            <p className="text-2xl font-bold text-[#137333] mt-0.5">
              {lagMetrics.buckets[0]?.percentage || 0}%
              <span className="text-xs font-normal text-gray-400 ml-1.5">
                ({lagMetrics.buckets[0]?.conversions || 0} buyers)
              </span>
            </p>
            <p className="text-[11px] text-gray-500 mt-1">High purchase readiness</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#137333] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Converted Audience</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {lagMetrics.totalConvertedUsers}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">Evaluated across all touches</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1a73e8] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Latency Buckets Distribution Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Conversion Time Window Breakdown
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Click any bucket to filter customer journeys by conversion speed:
            </p>
          </div>
          {activeBucketId && (
            <button
              type="button"
              onClick={() => handleBucketClick(activeBucketId)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer self-start sm:self-center"
            >
              Clear Filter ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {lagMetrics.buckets.map((b) => {
            const isSelected = activeBucketId === b.id;
            return (
              <div
                key={b.id}
                onClick={() => handleBucketClick(b.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#1a73e8] bg-blue-50/50 ring-2 ring-[#1a73e8]/30 shadow-xs'
                    : 'border-gray-200/80 bg-[#f8fafd] hover:bg-white hover:border-gray-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{b.label}</span>
                  <span className="text-xs font-extrabold" style={{ color: b.color }}>
                    {b.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200/80 h-2 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(4, b.percentage))}%`,
                      backgroundColor: b.color,
                    }}
                  />
                </div>

                <div className="mt-3 space-y-1 text-[11px] text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conversions:</span>
                    <span className="font-semibold text-gray-800">{b.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Revenue:</span>
                    <span className="font-semibold text-gray-800">
                      ${b.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Ticket (AOV):</span>
                    <span className="font-semibold text-gray-800">${b.avgOrderValue}</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 mt-2.5 pt-2 border-t border-gray-200/60 leading-tight">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Starting Channel Speed Benchmark */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Conversion Velocity by Starting (First-Touch) Channel
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            How long it takes for a customer to complete a purchase based on where they first discovered your brand:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8fafd] text-gray-600 font-semibold">
                <th className="py-2.5 px-4">Starting Channel</th>
                <th className="py-2.5 px-4 text-center">Avg Days to Convert</th>
                <th className="py-2.5 px-4 text-center">Fastest Recorded</th>
                <th className="py-2.5 px-4 text-center">Converted Journeys</th>
                <th className="py-2.5 px-4 text-right">Attributed Revenue</th>
                <th className="py-2.5 px-4">Ad Flighting Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lagMetrics.byStartingChannel.map((chMetric) => {
                const isFast = chMetric.avgDaysToConvert <= 3.5;
                const isSlow = chMetric.avgDaysToConvert > 7.0;

                return (
                  <tr key={chMetric.channel} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <ChannelIcon channel={chMetric.channel} size={22} />
                        <span>{chMetric.channel}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-gray-900">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isFast
                            ? 'bg-emerald-50 text-[#137333]'
                            : isSlow
                            ? 'bg-amber-50 text-[#b06000]'
                            : 'bg-blue-50 text-[#1a73e8]'
                        }`}
                      >
                        {chMetric.avgDaysToConvert} days
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500">
                      {chMetric.fastestConversionDays <= 0
                        ? '&lt; 1 day'
                        : `${chMetric.fastestConversionDays}d`}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-gray-700">
                      {chMetric.firstTouchCount}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      ${chMetric.totalRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-gray-600">
                      {isFast && (
                        <span className="text-[#137333] font-medium">
                          ⚡ Rapid retargeting: Trigger cart recovery within 24–48 hours.
                        </span>
                      )}
                      {isSlow && (
                        <span className="text-[#b06000] font-medium">
                          📅 Long consideration: Run 14-day nurture drip & retargeting.
                        </span>
                      )}
                      {!isFast && !isSlow && (
                        <span className="text-gray-600">
                          🎯 Standard flight: Follow up on Day 3 and Day 7 with social proof.
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
