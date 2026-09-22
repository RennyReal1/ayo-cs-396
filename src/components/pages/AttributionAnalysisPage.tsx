import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { AttributionModelRow, ChannelName } from '../../types';
import { CHANNELS, CHANNEL_COLORS } from '../../utils/dataEngine';
import { ChannelIcon } from '../ChannelIcon';
import { HelpCircle, Info, ArrowUpRight } from 'lucide-react';

interface AttributionAnalysisPageProps {
  attributionModels: AttributionModelRow[];
  totalConversions: number;
}

export const AttributionAnalysisPage: React.FC<AttributionAnalysisPageProps> = ({
  attributionModels,
  totalConversions,
}) => {
  const [activeModelHighlight, setActiveModelHighlight] = useState<string>('all');

  // Format data for Recharts (models as rows or channels as bars)
  const chartData = attributionModels;

  // Compute channel-centric data for the table
  // Each channel gets its credit across the 4 models
  const channelTableData = CHANNELS.map((channel) => {
    const ft = attributionModels.find((m) => m.model === 'First-Touch')?.[channel] || 0;
    const lt = attributionModels.find((m) => m.model === 'Last-Touch')?.[channel] || 0;
    const lin = attributionModels.find((m) => m.model === 'Linear')?.[channel] || 0;
    const pb = attributionModels.find((m) => m.model === 'Position-Based')?.[channel] || 0;

    return {
      channel,
      firstTouch: ft,
      firstTouchConvs: Number(((ft / 100) * totalConversions).toFixed(1)),
      lastTouch: lt,
      lastTouchConvs: Number(((lt / 100) * totalConversions).toFixed(1)),
      linear: lin,
      linearConvs: Number(((lin / 100) * totalConversions).toFixed(1)),
      positionBased: pb,
      positionBasedConvs: Number(((pb / 100) * totalConversions).toFixed(1)),
      color: CHANNEL_COLORS[channel],
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attribution Analysis</h1>
        <p className="text-xs text-gray-500 mt-1">
          Evaluate cross-channel contribution across single-touch and multi-touch algorithmic models
        </p>
      </div>

      {/* Expanded Attribution Comparison Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Attribution Model Comparison</h2>
            <p className="text-xs text-gray-500">
              Percentage of total conversion credit assigned to each channel by attribution logic
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Total conversions analyzed:</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e8f0fe] text-[#1a73e8]">
              {totalConversions.toLocaleString()} conversions
            </span>
          </div>
        </div>

        {/* Large Chart Canvas */}
        <div className="w-full h-80 sm:h-96 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
              barGap={4}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
              <XAxis
                dataKey="model"
                tickLine={false}
                axisLine={{ stroke: '#e8eaed' }}
                tick={{ fill: '#202124', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#70757a', fontSize: 11 }}
                domain={[0, 45]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                formatter={(val: any, name: any) => [`${val}% of conversions`, name]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e8eaed',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 16, fontSize: 12 }}
                iconType="circle"
              />
              {CHANNELS.map((channel) => (
                <Bar
                  key={channel}
                  dataKey={channel}
                  fill={CHANNEL_COLORS[channel]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table of Each Channel's Credit Under Each Model */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Channel Credit Share by Attribution Model</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Exact percentage share and attributed conversion volume per channel
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8fafd] text-gray-600 font-semibold">
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">First-Touch</th>
                <th className="py-3 px-4">Last-Touch</th>
                <th className="py-3 px-4">Linear</th>
                <th className="py-3 px-4">Position-Based (40/20/40)</th>
                <th className="py-3 px-4 text-right">Attribution Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {channelTableData.map((row) => {
                const maxModel = Math.max(row.firstTouch, row.lastTouch, row.linear, row.positionBased);
                const minModel = Math.min(row.firstTouch, row.lastTouch, row.linear, row.positionBased);
                const variance = Number((maxModel - minModel).toFixed(1));

                return (
                  <tr key={row.channel} className="hover:bg-gray-50/80 transition-colors">
                    {/* Channel */}
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <ChannelIcon channel={row.channel} size={22} />
                        <div>
                          <span className="font-bold text-gray-900 text-sm">{row.channel}</span>
                        </div>
                      </div>
                    </td>

                    {/* First-Touch */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-900">{row.firstTouch}%</div>
                        <div className="text-[11px] text-gray-400 font-medium">
                          {row.firstTouchConvs} convs
                        </div>
                      </div>
                    </td>

                    {/* Last-Touch */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-900">{row.lastTouch}%</div>
                        <div className="text-[11px] text-gray-400 font-medium">
                          {row.lastTouchConvs} convs
                        </div>
                      </div>
                    </td>

                    {/* Linear */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-900">{row.linear}%</div>
                        <div className="text-[11px] text-gray-400 font-medium">
                          {row.linearConvs} convs
                        </div>
                      </div>
                    </td>

                    {/* Position-Based */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-[#1a73e8]">{row.positionBased}%</div>
                        <div className="text-[11px] text-gray-400 font-medium">
                          {row.positionBasedConvs} convs
                        </div>
                      </div>
                    </td>

                    {/* Variance */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        ±{variance}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Methodology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">First-Touch</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8]">
              Single-Touch
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Credits 100% of conversion value to the initial marketing touchpoint that introduced the user to the brand.
          </p>
          <div className="text-[11px] text-gray-500 font-medium pt-1 border-t border-gray-100">
            Best for: Top-of-funnel discovery & brand awareness campaigns
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Last-Touch</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef7e0] text-[#b06000]">
              Single-Touch
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Credits 100% of conversion value to the final interaction immediately preceding purchase or signup.
          </p>
          <div className="text-[11px] text-gray-500 font-medium pt-1 border-t border-gray-100">
            Best for: Identifying high-intent closing channels like Search and Direct
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Linear</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333]">
              Multi-Touch
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Distributes credit equally across all touchpoints (1/N) in the customer journey from start to finish.
          </p>
          <div className="text-[11px] text-gray-500 font-medium pt-1 border-t border-gray-100">
            Best for: Balanced cross-channel nurturing evaluation
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Position-Based</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f3e8fd] text-[#9334e8]">
              Multi-Touch
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Allocates 40% to first touch, 40% to last touch, and divides 20% across all intermediate nurturing interactions.
          </p>
          <div className="text-[11px] text-gray-500 font-medium pt-1 border-t border-gray-100">
            Best for: Valuing acquisition and closing while giving credit to consideration
          </div>
        </div>
      </div>
    </div>
  );
};
