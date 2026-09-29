import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  Zap,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Touchpoint, ChannelName } from '../types';
import { computeDayOfWeekSummary, CHANNELS, CHANNEL_COLORS } from '../utils/dataEngine';
import { ChannelIcon } from './ChannelIcon';

interface DayOfWeekHeatmapProps {
  touchpoints: Touchpoint[];
}

export const DayOfWeekHeatmap: React.FC<DayOfWeekHeatmapProps> = ({ touchpoints }) => {
  const summary = useMemo(() => {
    return computeDayOfWeekSummary(touchpoints);
  }, [touchpoints]);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(2); // Default Tuesday
  const activeDay = summary.days[selectedDayIndex] || summary.days[0];

  // Maximum interactions across any single day for scaling heatmap intensity
  const maxInteractions = Math.max(1, ...summary.days.map((d) => d.totalInteractions));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white rounded-2xl border border-emerald-200/60 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#137333] text-white">
                <Calendar className="w-3.5 h-3.5" />
                Ad Scheduling Intelligence
              </span>
              <span className="text-xs font-semibold text-gray-500">
                When Do Customers Frequently Visit & Convert?
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1.5">
              Day-of-Week Customer Activity & Flighting Calendar
            </h2>
            <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
              Determine the exact days to deploy ad budget across video, display, search, and email based on historical conversion velocity.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-emerald-100 shadow-2xs self-start md:self-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Peak Conversion Day</p>
              <p className="text-sm font-bold text-[#137333] mt-0.5">
                {summary.peakDayConversions}
              </p>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Peak Discovery Day</p>
              <p className="text-sm font-bold text-[#1a73e8] mt-0.5">
                {summary.peakDayDiscovery}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Interactive Heatmap Strip */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1a73e8]" />
            Weekly Customer Traffic & Conversion Intensity
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">
            Click any day to inspect channel distribution
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {summary.days.map((day) => {
            const isSelected = selectedDayIndex === day.dayIndex;
            const intensityPct = (day.totalInteractions / maxInteractions) * 100;

            return (
              <div
                key={day.dayName}
                onClick={() => setSelectedDayIndex(day.dayIndex)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#1a73e8] bg-blue-50/60 ring-2 ring-[#1a73e8]/30 shadow-xs'
                    : 'border-gray-200/80 bg-[#f8fafd] hover:bg-white hover:border-gray-300 hover:shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{day.shortName}</span>
                    <span className="text-[10px] font-semibold text-gray-400">
                      {day.dayName.slice(0, 3)}
                    </span>
                  </div>

                  <p className="text-lg font-black text-gray-900 mt-1">
                    {day.totalConversions}{' '}
                    <span className="text-[10px] font-normal text-gray-400">sales</span>
                  </p>

                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {day.totalInteractions} touches
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-200/60 space-y-1.5">
                  {/* Intensity Bar */}
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1a73e8] rounded-full"
                      style={{ width: `${Math.max(10, intensityPct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">Top Channel:</span>
                    <span className="font-bold text-gray-800">{day.topChannel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1a73e8] text-white">
                {activeDay.dayName}
              </span>
              <h3 className="text-sm font-bold text-gray-900">
                Detailed Channel Activity Breakdown
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeDay.bestUse}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div>
              <span className="text-gray-400">Total Revenue:</span>{' '}
              <span className="text-gray-900">${activeDay.totalRevenue.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400">Conversion Rate:</span>{' '}
              <span className="text-[#137333]">{activeDay.conversionRate}%</span>
            </div>
          </div>
        </div>

        {/* Channel Bars on Selected Day */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CHANNELS.map((ch) => {
            const count = activeDay.channelCounts[ch] || 0;
            const conv = activeDay.channelConversions[ch] || 0;
            const share =
              activeDay.totalInteractions > 0
                ? ((count / activeDay.totalInteractions) * 100).toFixed(1)
                : '0';

            return (
              <div
                key={ch}
                className="p-3.5 rounded-xl border border-gray-100 bg-[#f8fafd] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <ChannelIcon channel={ch} size={24} />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{ch}</p>
                    <p className="text-[11px] text-gray-500">
                      {count} touches ({share}%)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#137333]">{conv} converted</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended 3-Stage Flight Schedule */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#f9ab00]" />
            Recommended Weekly Flighting Schedule by Funnel Stage
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Synchronize your ad deployments with when target customers move through each decision stage:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary.recommendedFlightSchedule.map((flight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-gray-200/80 bg-[#f8fafd] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">{flight.stage}</span>
                <span className="text-[10px] font-bold text-[#1a73e8] bg-blue-50 px-2 py-0.5 rounded-full">
                  Stage #{idx + 1}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Best Days to Send:
                </span>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {flight.bestDays.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-0.5 rounded-md text-xs font-bold bg-white border border-gray-200 text-gray-800"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Target Channels:
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {flight.recommendedChannels.map((ch) => (
                    <div key={ch} className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                      <ChannelIcon channel={ch} size={16} />
                      <span>{ch}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-gray-600 leading-relaxed pt-2 border-t border-gray-200/60">
                {flight.rationale}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
