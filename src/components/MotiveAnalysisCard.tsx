import React, { useMemo } from 'react';
import {
  Sparkles,
  DollarSign,
  TrendingUp,
  Gift,
  Ticket,
  Zap,
  Search,
  Repeat,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UserJourney, MotiveType } from '../types';
import { computeMotiveBreakdowns, CHANNEL_COLORS } from '../utils/dataEngine';
import { ChannelIcon } from './ChannelIcon';

interface MotiveAnalysisCardProps {
  journeys: UserJourney[];
  selectedMotive?: MotiveType | 'all';
  onSelectMotive?: (motive: MotiveType | 'all') => void;
}

export const MotiveAnalysisCard: React.FC<MotiveAnalysisCardProps> = ({
  journeys,
  selectedMotive = 'all',
  onSelectMotive,
}) => {
  const motives = useMemo(() => {
    return computeMotiveBreakdowns(journeys);
  }, [journeys]);

  const totalRevenue = motives.reduce((sum, m) => sum + m.revenue, 0);

  // Highest revenue motive
  const topRevenueMotive = [...motives].sort((a, b) => b.revenue - a.revenue)[0];
  // Highest ticket size motive
  const highestTicketMotive = [...motives].sort((a, b) => b.avgOrderValue - a.avgOrderValue)[0];

  const getMotiveIcon = (motive: MotiveType) => {
    switch (motive) {
      case 'Birthday & Milestone Gift':
        return <Gift className="w-4 h-4 text-[#9334e8]" />;
      case 'Festival & Event Prep':
        return <Ticket className="w-4 h-4 text-[#b06000]" />;
      case 'Impulse Flash Sale':
        return <Zap className="w-4 h-4 text-[#137333]" />;
      case 'High-Ticket Deliberation':
        return <Search className="w-4 h-4 text-[#1a73e8]" />;
      case 'Routine Replenishment':
        return <Repeat className="w-4 h-4 text-[#70757a]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-pink-50/70 via-purple-50/40 to-white rounded-2xl border border-pink-200/60 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#9334e8] text-white">
                <Sparkles className="w-3.5 h-3.5" />
                Purchase Motive & Intent Intelligence
              </span>
              <span className="text-xs font-semibold text-gray-500">
                What Makes the Most Money?
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1.5">
              Customer Purchase Motive & Basket Value Segmentation
            </h2>
            <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
              Deconstruct why customers buy: categorize journeys into Birthday Gifting, Festival Preparation (e.g. Coachella), Impulse Buys, and High-Ticket Research to uncover where your highest-margin revenue originates.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-pink-100 shadow-2xs self-start md:self-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Top Revenue Driver</p>
              <p className="text-sm font-bold text-[#9334e8] mt-0.5">
                {topRevenueMotive?.motive}
              </p>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Highest Basket Size</p>
              <p className="text-sm font-bold text-[#137333] mt-0.5">
                ${highestTicketMotive?.avgOrderValue} AOV
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Motives Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {motives.map((m) => {
          const isSelected = selectedMotive === m.motive;
          const revenueShare =
            totalRevenue > 0 ? ((m.revenue / totalRevenue) * 100).toFixed(1) : '0';

          return (
            <div
              key={m.motive}
              onClick={() => onSelectMotive?.(isSelected ? 'all' : m.motive)}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#9334e8] ring-2 ring-[#9334e8]/20 shadow-md'
                  : 'border-gray-200/80 hover:border-gray-300 hover:shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: m.badgeBg }}
                    >
                      {getMotiveIcon(m.motive)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 leading-tight">
                        {m.motive}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {m.conversions} conversions ({m.totalUsers} users)
                      </span>
                    </div>
                  </div>

                  <span
                    className="text-xs font-extrabold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: m.badgeColor }}
                  >
                    {revenueShare}%
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed min-h-[32px]">
                  {m.description}
                </p>

                {/* Metrics */}
                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#f8fafd] p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">
                      Total Revenue
                    </span>
                    <span className="text-sm font-black text-gray-900">
                      ${m.revenue.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#f8fafd] p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">
                      Avg Order (AOV)
                    </span>
                    <span className="text-sm font-black text-[#137333]">
                      ${m.avgOrderValue}
                    </span>
                  </div>
                </div>

                {/* Top Channels */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Key Influencing Channels:
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {m.topChannels.map((ch) => (
                      <div
                        key={ch}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border"
                        style={{
                          borderColor: `${CHANNEL_COLORS[ch]}30`,
                          backgroundColor: `${CHANNEL_COLORS[ch]}10`,
                          color: CHANNEL_COLORS[ch],
                        }}
                      >
                        <ChannelIcon channel={ch} size={14} />
                        <span>{ch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter indicator */}
              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {m.confidence}% model confidence
                </span>
                <span
                  className={`font-semibold ${
                    isSelected ? 'text-[#9334e8]' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {isSelected ? '✓ Active Filter' : 'Filter Journeys →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
