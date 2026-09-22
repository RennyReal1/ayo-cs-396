import React, { useMemo } from 'react';
import { Touchpoint } from '../../types';
import { computeChannelPerformance, CHANNELS, CHANNEL_COLORS } from '../../utils/dataEngine';
import { ChannelIcon } from '../ChannelIcon';
import { Compass, Repeat, Trophy, DollarSign, Layers } from 'lucide-react';

interface ChannelPerformancePageProps {
  touchpoints: Touchpoint[];
}

export const ChannelPerformancePage: React.FC<ChannelPerformancePageProps> = ({ touchpoints }) => {
  const channelData = useMemo(() => {
    return computeChannelPerformance(touchpoints);
  }, [touchpoints]);

  // Identify top roles
  const topDiscovery = useMemo(() => {
    return [...channelData].sort((a, b) => b.firstTouchPct - a.firstTouchPct)[0];
  }, [channelData]);

  const topNurturing = useMemo(() => {
    return [...channelData].sort((a, b) => b.middleTouchPct - a.middleTouchPct)[0];
  }, [channelData]);

  const topCloser = useMemo(() => {
    return [...channelData].sort((a, b) => b.lastTouchPct - a.lastTouchPct)[0];
  }, [channelData]);

  const totalTouchpoints = touchpoints.length;
  const totalRevenue = channelData.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Channel Performance</h1>
        <p className="text-xs text-gray-500 mt-1">
          Detailed breakdown of each channel&apos;s role in customer discovery, nurturing, and final conversion
        </p>
      </div>

      {/* Role Leader Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Discovery Channel */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Top Discovery Channel
            </span>
            <div className="flex items-center gap-2">
              <ChannelIcon channel={topDiscovery?.channel || 'Search'} size={24} />
              <span className="text-xl font-bold text-gray-900">{topDiscovery?.channel}</span>
            </div>
            <p className="text-xs text-gray-500">
              Initiates <span className="font-bold text-[#1a73e8]">{topDiscovery?.firstTouchPct}%</span> of all customer journeys
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        {/* Top Nurturing Channel */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Top Nurturing Channel
            </span>
            <div className="flex items-center gap-2">
              <ChannelIcon channel={topNurturing?.channel || 'YouTube'} size={24} />
              <span className="text-xl font-bold text-gray-900">{topNurturing?.channel}</span>
            </div>
            <p className="text-xs text-gray-500">
              Accounts for <span className="font-bold text-[#9334e8]">{topNurturing?.middleTouchPct}%</span> of middle interactions
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#f3e8fd] text-[#9334e8] flex items-center justify-center shrink-0">
            <Repeat className="w-6 h-6" />
          </div>
        </div>

        {/* Top Closer Channel */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Top Closer Channel
            </span>
            <div className="flex items-center gap-2">
              <ChannelIcon channel={topCloser?.channel || 'Direct'} size={24} />
              <span className="text-xl font-bold text-gray-900">{topCloser?.channel}</span>
            </div>
            <p className="text-xs text-gray-500">
              Concludes <span className="font-bold text-[#137333]">{topCloser?.lastTouchPct}%</span> of total journeys
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Channel Performance Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Channel Performance & Touchpoint Sequence Analysis</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Touchpoints, conversions, revenue, and positional frequency in user journeys
            </p>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Total Touchpoints: <span className="font-bold text-gray-900">{totalTouchpoints.toLocaleString()}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8fafd] text-gray-600 font-semibold">
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-center">Total Touchpoints</th>
                <th className="py-3 px-4 text-center">Conversions</th>
                <th className="py-3 px-4 text-right">Revenue (USD)</th>
                <th className="py-3 px-4">First Touch (Discovery)</th>
                <th className="py-3 px-4">Middle Touch (Nurturing)</th>
                <th className="py-3 px-4">Last Touch (Closing)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {channelData.map((row) => (
                <tr key={row.channel} className="hover:bg-gray-50/80 transition-colors">
                  {/* Channel Name */}
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    <div className="flex items-center gap-2.5">
                      <ChannelIcon channel={row.channel} size={22} />
                      <span className="font-bold text-gray-900 text-sm">{row.channel}</span>
                    </div>
                  </td>

                  {/* Touchpoints */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                      {row.touchpoints.toLocaleString()}
                    </span>
                  </td>

                  {/* Conversions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="font-bold text-gray-900 text-sm">{row.conversions}</div>
                    <div className="text-[10px] text-gray-400">{row.conversionRate}% conv rate</div>
                  </td>

                  {/* Revenue */}
                  <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                    ${row.revenue.toLocaleString()}
                  </td>

                  {/* First Touch */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-gray-800">{row.firstTouchCount} users</span>
                        <span className="font-bold text-[#1a73e8]">{row.firstTouchPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-[#1a73e8]"
                          style={{ width: `${Math.min(row.firstTouchPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Middle Touch */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-gray-800">{row.middleTouchCount} touches</span>
                        <span className="font-bold text-[#9334e8]">{row.middleTouchPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-[#9334e8]"
                          style={{ width: `${Math.min(row.middleTouchPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Last Touch */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-gray-800">{row.lastTouchCount} users</span>
                        <span className="font-bold text-[#137333]">{row.lastTouchPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-[#137333]"
                          style={{ width: `${Math.min(row.lastTouchPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
