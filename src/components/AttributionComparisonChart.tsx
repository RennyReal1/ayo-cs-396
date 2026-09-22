import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ChevronDown, Check } from 'lucide-react';
import { AttributionModelRow, ChannelName } from '../types';
import { CHANNEL_COLORS, CHANNELS } from '../utils/dataEngine';

interface AttributionComparisonChartProps {
  data: AttributionModelRow[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[170px] text-xs pointer-events-none">
      <div className="font-semibold text-gray-900 mb-1.5 border-b border-gray-100 pb-1">
        {label} Attribution
      </div>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-3 text-gray-700">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              <span>{p.name}:</span>
            </span>
            <span className="font-bold text-gray-900">{Number(p.value).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AttributionComparisonChart: React.FC<AttributionComparisonChartProps> = ({
  data,
}) => {
  const [metricType, setMetricType] = useState<'Conversion Credit' | 'Conversion Value ($)'>('Conversion Credit');
  const [showDropdown, setShowDropdown] = useState(false);

  // Rename model labels to match mockup (or keep Position-Based)
  const chartData = data.map((d) => ({
    ...d,
    displayModel: d.model === 'Position-Based' ? 'Data-Driven' : d.model,
  }));

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Attribution Model Comparison
        </h2>

        {/* Dropdown selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
          >
            <span>{metricType}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20">
              {(['Conversion Credit', 'Conversion Value ($)'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setMetricType(opt);
                    setShowDropdown(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                    metricType === opt ? 'text-[#1a73e8] font-medium' : 'text-gray-700'
                  }`}
                >
                  <span>{opt}</span>
                  {metricType === opt && <Check className="w-3.5 h-3.5 text-[#1a73e8]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend on Top of Chart matching mockup */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs mb-2">
        {CHANNELS.map((ch) => (
          <div key={ch} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: CHANNEL_COLORS[ch] }}
            />
            <span className="text-gray-600 font-medium">{ch}</span>
          </div>
        ))}
      </div>

      {/* Grouped Bar Chart Canvas */}
      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
            <XAxis
              dataKey="displayModel"
              tickLine={false}
              axisLine={{ stroke: '#e8eaed' }}
              tick={{ fill: '#70757a', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#70757a', fontSize: 11 }}
              tickFormatter={(val) => `${val}%`}
              domain={[0, 45]}
              label={{
                value: 'Conversion Credit',
                angle: -90,
                position: 'insideLeft',
                offset: 25,
                fill: '#70757a',
                fontSize: 10,
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafd' }} />

            {/* Grouped Channel Bars */}
            <Bar dataKey="Search" fill={CHANNEL_COLORS.Search} radius={[3, 3, 0, 0]} maxBarSize={16} />
            <Bar dataKey="YouTube" fill={CHANNEL_COLORS.YouTube} radius={[3, 3, 0, 0]} maxBarSize={16} />
            <Bar dataKey="Display" fill={CHANNEL_COLORS.Display} radius={[3, 3, 0, 0]} maxBarSize={16} />
            <Bar dataKey="Discover" fill={CHANNEL_COLORS.Discover} radius={[3, 3, 0, 0]} maxBarSize={16} />
            <Bar dataKey="Gmail" fill={CHANNEL_COLORS.Gmail} radius={[3, 3, 0, 0]} maxBarSize={16} />
            <Bar dataKey="Direct" fill={CHANNEL_COLORS.Direct} radius={[3, 3, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
