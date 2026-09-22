import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChannelContribution } from '../types';

interface ChannelContributionChartProps {
  contributions: ChannelContribution[];
  totalConversions: number;
}

export const ChannelContributionChart: React.FC<ChannelContributionChartProps> = ({
  contributions,
  totalConversions,
}) => {
  // Ensure we have data
  const data = contributions.length > 0 ? contributions : [];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900">
          Channel Contribution to Conversions
        </h2>
      </div>

      {/* Donut & Legend Container */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto pt-2">
        {/* Donut Chart with Center Text */}
        <div className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="conversions"
                nameKey="channel"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={`cell-${entry.channel}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any, item: any) => [
                  `${value} conversions (${item.payload.percentage}%)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e8eaed',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {totalConversions.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-gray-500">Conversions</span>
          </div>
        </div>

        {/* Legend List on Right */}
        <div className="w-full sm:w-44 space-y-2 text-xs">
          {data.map((item) => (
            <div
              key={item.channel}
              className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-gray-700">{item.channel}</span>
              </div>
              <span className="font-bold text-gray-900">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
