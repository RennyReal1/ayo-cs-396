import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { WeeklyTrendPoint } from '../types';

interface ConversionTrendChartProps {
  data: WeeklyTrendPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const conversions = payload[0]?.value;
  const convRate = payload[1]?.value;
  const pointData = payload[0]?.payload as WeeklyTrendPoint;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[170px] text-xs pointer-events-none">
      <div className="font-semibold text-gray-900 mb-1.5 border-b border-gray-100 pb-1">
        {pointData?.fullLabel || pointData?.displayDate || label}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3 text-gray-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1a73e8]" />
            Conversions:
          </span>
          <span className="font-bold text-gray-900">{conversions?.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-gray-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4285f4]" />
            Conversion Rate:
          </span>
          <span className="font-bold text-[#1a73e8]">{convRate}%</span>
        </div>
        {pointData?.totalInteractions !== undefined && (
          <div className="flex items-center justify-between gap-3 text-gray-500 pt-0.5 border-t border-gray-50">
            <span>Interactions:</span>
            <span className="font-medium text-gray-700">{pointData.totalInteractions.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ConversionTrendChart: React.FC<ConversionTrendChartProps> = ({ data }) => {
  const chartData = data && data.length > 0 ? data : [];

  // Calculate suitable Y-axis max for conversions
  const maxConversions = chartData.reduce((m, d) => Math.max(m, d.conversions), 0);
  const yConversionsMax = maxConversions > 0 ? Math.ceil(maxConversions * 1.25) : 10;

  // Calculate suitable Y-axis max for conversion rate
  const maxRate = chartData.reduce((m, d) => Math.max(m, d.conversionRate), 0);
  const yRateMax = maxRate > 0 ? Math.max(10, Math.ceil(maxRate * 1.25)) : 10;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-gray-900">Conversion Trend</h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
            Weekly
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-gray-700">
            <span className="w-4 h-0.5 bg-[#1a73e8] rounded-full inline-block" />
            <span className="font-medium">Conversions</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-[#4285f4] inline-block" />
            <span>Conversion Rate</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#1a73e8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
            
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={{ stroke: '#e8eaed' }}
              tick={{ fill: '#70757a', fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={20}
            />

            {/* Left Y-axis: Conversions */}
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#70757a', fontSize: 11 }}
              domain={[0, yConversionsMax]}
              tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}K` : `${val}`)}
            />

            {/* Right Y-axis: Conversion Rate */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#70757a', fontSize: 11 }}
              tickFormatter={(val) => `${val}%`}
              domain={[0, yRateMax]}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#1a73e8', strokeWidth: 1, strokeDasharray: '4 4' }}
            />

            {/* Conversions Area + Line */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="conversions"
              stroke="#1a73e8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorConversions)"
              activeDot={{ r: 5, fill: '#1a73e8', stroke: '#fff', strokeWidth: 2 }}
            />

            {/* Conversion Rate Dashed Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="conversionRate"
              stroke="#4285f4"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

