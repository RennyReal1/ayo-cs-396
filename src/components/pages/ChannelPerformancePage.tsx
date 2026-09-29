import React, { useState, useMemo } from 'react';
import { Touchpoint } from '../../types';
import { computeChannelPerformance, CHANNELS, CHANNEL_COLORS } from '../../utils/dataEngine';
import { ChannelIcon } from '../ChannelIcon';
import {
  Compass,
  Repeat,
  Trophy,
  DollarSign,
  Layers,
  Scale,
  Calendar,
  BarChart2,
} from 'lucide-react';
import { HeadToHeadComparison } from '../HeadToHeadComparison';
import { DayOfWeekHeatmap } from '../DayOfWeekHeatmap';

interface ChannelPerformancePageProps {
  touchpoints: Touchpoint[];
}

export const ChannelPerformancePage: React.FC<ChannelPerformancePageProps> = ({
  touchpoints,
}) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'headtohead' | 'dayofweek'>('roles');

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
      {/* Header with Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Channel Performance</h1>
          <p className="text-xs text-gray-500 mt-1">
            Detailed breakdown of each channel&apos;s role in customer discovery, nurturing, final conversion, and weekly scheduling
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-[#f1f3f4] p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-white text-[#1a73e8] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Channel Roles & Metrics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('headtohead')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'headtohead'
                ? 'bg-white text-[#9334e8] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Head-to-Head Comparison</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dayofweek')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'dayofweek'
                ? 'bg-white text-[#137333] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Day-of-Week Ad Flighting</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Channel Roles & Full Breakdown */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
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
                  Initiates{' '}
                  <span className="font-bold text-[#1a73e8]">{topDiscovery?.firstTouchPct}%</span> of
                  all customer journeys
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
                  Accounts for{' '}
                  <span className="font-bold text-[#9334e8]">{topNurturing?.middleTouchPct}%</span>{' '}
                  of middle interactions
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
                  Concludes{' '}
                  <span className="font-bold text-[#137333]">{topCloser?.lastTouchPct}%</span> of
                  total journeys
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Performance Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                Channel Attribution Breakdown & Conversion Funnel
              </h3>
              <span className="text-xs text-gray-400">
                Total Revenue: ${totalRevenue.toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#f8fafd] text-gray-600 font-semibold">
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4 text-center">Touchpoints</th>
                    <th className="py-3 px-4 text-center">First Touch (Discovery)</th>
                    <th className="py-3 px-4 text-center">Middle Touch (Nurturing)</th>
                    <th className="py-3 px-4 text-center">Last Touch (Closing)</th>
                    <th className="py-3 px-4 text-right">Attributed Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {channelData.map((c) => (
                    <tr key={c.channel} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <ChannelIcon channel={c.channel} size={20} />
                          <span className="font-bold text-gray-900">{c.channel}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-gray-700">
                        {c.touchpoints.toLocaleString()}{' '}
                        <span className="text-gray-400 text-[10px]">
                          ({totalTouchpoints > 0 ? ((c.touchpoints / totalTouchpoints) * 100).toFixed(1) : 0}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1a73e8]">
                          {c.firstTouchCount} ({c.firstTouchPct}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-[#9334e8]">
                          {c.middleTouchCount} ({c.middleTouchPct}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#137333]">
                          {c.lastTouchCount} ({c.lastTouchPct}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        ${c.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Head-to-Head Comparison */}
      {activeTab === 'headtohead' && <HeadToHeadComparison touchpoints={touchpoints} />}

      {/* Tab 3: Day-of-Week Flighting Calendar */}
      {activeTab === 'dayofweek' && <DayOfWeekHeatmap touchpoints={touchpoints} />}
    </div>
  );
};
