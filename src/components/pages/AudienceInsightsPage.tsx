import React, { useMemo } from 'react';
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
import { Touchpoint } from '../../types';
import { computeAudienceInsights } from '../../utils/dataEngine';
import { Users, GitFork, ArrowUpRight, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface AudienceInsightsPageProps {
  touchpoints: Touchpoint[];
}

export const AudienceInsightsPage: React.FC<AudienceInsightsPageProps> = ({ touchpoints }) => {
  const audienceData = useMemo(() => {
    return computeAudienceInsights(touchpoints);
  }, [touchpoints]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audience Insights</h1>
        <p className="text-xs text-gray-500 mt-1">
          Behavioral comparison between converting customers and non-converting prospects
        </p>
      </div>

      {/* Audience Behavior Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Journey Length Comparison */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Avg Journey Length
            </span>
            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
            <div>
              <span className="text-[11px] text-gray-500">Converters</span>
              <p className="text-2xl font-bold text-[#137333]">
                {audienceData.avgLengthConverters}{' '}
                <span className="text-xs font-normal text-gray-400">touches</span>
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500">Non-Converters</span>
              <p className="text-2xl font-bold text-gray-500">
                {audienceData.avgLengthNonConverters}{' '}
                <span className="text-xs font-normal text-gray-400">touches</span>
              </p>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Converting users engage in{' '}
            <span className="font-semibold text-gray-800">
              {Math.max(0, audienceData.avgLengthConverters - audienceData.avgLengthNonConverters).toFixed(1)} more
            </span>{' '}
            interactions before purchase.
          </p>
        </div>

        {/* Channel Diversity Comparison */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Avg Channels Explored
            </span>
            <div className="w-8 h-8 rounded-full bg-[#f3e8fd] text-[#9334e8] flex items-center justify-center">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
            <div>
              <span className="text-[11px] text-gray-500">Converters</span>
              <p className="text-2xl font-bold text-[#9334e8]">
                {audienceData.avgChannelsConverters}{' '}
                <span className="text-xs font-normal text-gray-400">channels</span>
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500">Non-Converters</span>
              <p className="text-2xl font-bold text-gray-500">
                {audienceData.avgChannelsNonConverters}{' '}
                <span className="text-xs font-normal text-gray-400">channels</span>
              </p>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Converters explore multiple touchpoints across search, video, and display networks.
          </p>
        </div>

        {/* Multi-Channel Lift */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Multi-Channel Lift
            </span>
            <div className="w-8 h-8 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 border-t border-gray-100 pt-3">
            <span className="text-3xl font-bold text-[#137333]">+{audienceData.liftMultiChannel}%</span>
            <span className="text-xs text-gray-500">conversion rate lift</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Multi-channel journeys convert at{' '}
            <span className="font-semibold text-gray-800">{audienceData.multiChannelConvRate}%</span> vs.{' '}
            <span className="font-semibold text-gray-800">{audienceData.singleChannelConvRate}%</span> for single-channel users.
          </p>
        </div>
      </div>

      {/* Grid of Two Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Converters vs. Non-converters by Journey Length */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Audience by Journey Length</h2>
            <p className="text-xs text-gray-500">
              Comparing converting vs. non-converting users across total touchpoint counts (1–8)
            </p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={audienceData.byJourneyLength}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#e8eaed' }}
                  tick={{ fill: '#70757a', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#70757a', fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} users`, name]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e8eaed',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 12 }} />
                <Bar
                  dataKey="converters"
                  name="Converters"
                  fill="#1a73e8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
                <Bar
                  dataKey="nonConverters"
                  name="Non-Converters"
                  fill="#dadce0"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Converters vs. Non-converters by Number of Different Channels Used */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Audience by Channel Diversity</h2>
            <p className="text-xs text-gray-500">
              User distribution based on number of distinct channels interacted with
            </p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={audienceData.byChannelDiversity}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#e8eaed' }}
                  tick={{ fill: '#70757a', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#70757a', fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} users`, name]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e8eaed',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 12 }} />
                <Bar
                  dataKey="converters"
                  name="Converters"
                  fill="#34a853"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
                <Bar
                  dataKey="nonConverters"
                  name="Non-Converters"
                  fill="#dadce0"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
