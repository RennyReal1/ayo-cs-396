import React, { useState, useMemo } from 'react';
import {
  Trophy,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Clock,
  Compass,
  Repeat,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ChannelName, Touchpoint } from '../types';
import { computeChannelPerformance, CHANNEL_COLORS, CHANNELS } from '../utils/dataEngine';
import { ChannelIcon } from './ChannelIcon';

interface HeadToHeadComparisonProps {
  touchpoints: Touchpoint[];
}

export const HeadToHeadComparison: React.FC<HeadToHeadComparisonProps> = ({ touchpoints }) => {
  const [channelA, setChannelA] = useState<ChannelName>('YouTube');
  const [channelB, setChannelB] = useState<ChannelName>('Search');

  const channelMetrics = useMemo(() => {
    return computeChannelPerformance(touchpoints);
  }, [touchpoints]);

  const metricA = useMemo(() => {
    return (
      channelMetrics.find((m) => m.channel === channelA) || {
        channel: channelA,
        touchpoints: 0,
        conversions: 0,
        conversionRate: 0,
        revenue: 0,
        firstTouchCount: 0,
        firstTouchPct: 0,
        middleTouchCount: 0,
        middleTouchPct: 0,
        lastTouchCount: 0,
        lastTouchPct: 0,
        color: CHANNEL_COLORS[channelA],
      }
    );
  }, [channelMetrics, channelA]);

  const metricB = useMemo(() => {
    return (
      channelMetrics.find((m) => m.channel === channelB) || {
        channel: channelB,
        touchpoints: 0,
        conversions: 0,
        conversionRate: 0,
        revenue: 0,
        firstTouchCount: 0,
        firstTouchPct: 0,
        middleTouchCount: 0,
        middleTouchPct: 0,
        lastTouchCount: 0,
        lastTouchPct: 0,
        color: CHANNEL_COLORS[channelB],
      }
    );
  }, [channelMetrics, channelB]);

  // Head-to-Head Comparisons
  const discoveryWinner =
    metricA.firstTouchCount >= metricB.firstTouchCount ? channelA : channelB;
  const nurturingWinner =
    metricA.middleTouchCount >= metricB.middleTouchCount ? channelA : channelB;
  const closerWinner =
    metricA.lastTouchCount >= metricB.lastTouchCount ? channelA : channelB;
  const revenueWinner = metricA.revenue >= metricB.revenue ? channelA : channelB;

  // Preset match-ups
  const presets: { name: string; a: ChannelName; b: ChannelName }[] = [
    { name: 'Video Discovery vs. Search Ads', a: 'YouTube', b: 'Search' },
    { name: 'Display Banners vs. Gmail Ads', a: 'Display', b: 'Gmail' },
    { name: 'Discover Feed vs. Video Ads', a: 'Discover', b: 'YouTube' },
    { name: 'Search Ads vs. Direct Organic', a: 'Search', b: 'Direct' },
  ];

  return (
    <div className="space-y-6">
      {/* Selector & Presets */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1a73e8] text-white">
                <Trophy className="w-3.5 h-3.5" />
                Head-to-Head Benchmark
              </span>
              <span className="text-xs font-semibold text-gray-500">
                Campaign & Channel Split Test
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-900 mt-1">
              Side-by-Side Ad & Channel Performance Comparison
            </h2>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setChannelA(p.a);
                  setChannelB(p.b);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  channelA === p.a && channelB === p.b
                    ? 'bg-blue-50 border-[#1a73e8] text-[#1a73e8] font-bold'
                    : 'bg-[#f8fafd] border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Channel Selection Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Channel A */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between"
            style={{
              borderColor: `${CHANNEL_COLORS[channelA]}40`,
              backgroundColor: `${CHANNEL_COLORS[channelA]}08`,
            }}
          >
            <div className="flex items-center gap-3">
              <ChannelIcon channel={channelA} size={36} />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Channel A
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <select
                    value={channelA}
                    onChange={(e) => setChannelA(e.target.value as ChannelName)}
                    className="text-sm font-bold text-gray-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {CHANNELS.map((ch) => (
                      <option key={ch} value={ch} disabled={ch === channelB}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: CHANNEL_COLORS[channelA] }}
            >
              {metricA.firstTouchPct}% Discovery
            </span>
          </div>

          {/* Channel B */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between"
            style={{
              borderColor: `${CHANNEL_COLORS[channelB]}40`,
              backgroundColor: `${CHANNEL_COLORS[channelB]}08`,
            }}
          >
            <div className="flex items-center gap-3">
              <ChannelIcon channel={channelB} size={36} />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Channel B
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <select
                    value={channelB}
                    onChange={(e) => setChannelB(e.target.value as ChannelName)}
                    className="text-sm font-bold text-gray-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {CHANNELS.map((ch) => (
                      <option key={ch} value={ch} disabled={ch === channelA}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: CHANNEL_COLORS[channelB] }}
            >
              {metricB.lastTouchPct}% Closing
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Discovery Reach */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">First-Touch Discovery</span>
            <Compass className="w-4 h-4 text-[#1a73e8]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <ChannelIcon channel={channelA} size={16} />
                <span>{channelA}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">
                {metricA.firstTouchCount} ({metricA.firstTouchPct}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <ChannelIcon channel={channelB} size={16} />
                <span>{channelB}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">
                {metricB.firstTouchCount} ({metricB.firstTouchPct}%)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Winner:</span>
            <span className="font-bold text-[#137333] flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {discoveryWinner}
            </span>
          </div>
        </div>

        {/* Metric 2: Middle Funnel Assistance */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Assisted Touches (Nurturing)</span>
            <Repeat className="w-4 h-4 text-[#9334e8]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <ChannelIcon channel={channelA} size={16} />
                <span>{channelA}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">
                {metricA.middleTouchCount} ({metricA.middleTouchPct}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <ChannelIcon channel={channelB} size={16} />
                <span>{channelB}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">
                {metricB.middleTouchCount} ({metricB.middleTouchPct}%)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Winner:</span>
            <span className="font-bold text-[#9334e8] flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {nurturingWinner}
            </span>
          </div>
        </div>

        {/* Metric 3: Final Conversion Closing */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Last-Touch Conversions</span>
            <CheckCircle2 className="w-4 h-4 text-[#137333]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <ChannelIcon channel={channelA} size={16} />
                <span>{channelA}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">
                {metricA.lastTouchCount} ({metricA.lastTouchPct}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <ChannelIcon channel={channelB} size={16} />
                <span>{channelB}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">
                {metricB.lastTouchCount} ({metricB.lastTouchPct}%)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Winner:</span>
            <span className="font-bold text-[#137333] flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {closerWinner}
            </span>
          </div>
        </div>

        {/* Metric 4: Attributed Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Total Revenue Generated</span>
            <DollarSign className="w-4 h-4 text-[#b06000]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <ChannelIcon channel={channelA} size={16} />
                <span>{channelA}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">
                ${metricA.revenue.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <ChannelIcon channel={channelB} size={16} />
                <span>{channelB}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">
                ${metricB.revenue.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Winner:</span>
            <span className="font-bold text-[#b06000] flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {revenueWinner}
            </span>
          </div>
        </div>
      </div>

      {/* Strategic Synergy Verdict */}
      <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-100 p-5 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#1a73e8] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Attribution Verdict & Media Mix Synergy
          </h4>
          <p className="text-xs text-gray-700 leading-relaxed">
            <strong>{channelA}</strong> and <strong>{channelB}</strong> should not compete for the same conversion metric. {discoveryWinner === channelA ? channelA : channelB} excels at generating low-cost top-of-funnel reach, while {closerWinner === channelB ? channelB : channelA} is the ultimate conversion closer.
            Retargeting users who engaged with {discoveryWinner} using {closerWinner} yields the highest ROAS combination.
          </p>
        </div>
      </div>
    </div>
  );
};
