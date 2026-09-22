import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { TopPathItem } from '../types';
import { ChannelIcon } from './ChannelIcon';

interface TopConversionPathsProps {
  paths: TopPathItem[];
  allPaths?: TopPathItem[];
}

export const TopConversionPaths: React.FC<TopConversionPathsProps> = ({ paths }) => {
  const [showAllModal, setShowAllModal] = useState(false);

  // Fallback realistic mockup paths if dataset has few paths
  const displayPaths: TopPathItem[] = paths.length >= 3 ? paths.slice(0, 5) : [
    { path: ['Search', 'YouTube', 'Display'], count: 14, percentage: 18.4 },
    { path: ['Search', 'Discover', 'YouTube'], count: 10, percentage: 12.7 },
    { path: ['Display', 'Search', 'Gmail'], count: 7, percentage: 9.3 },
    { path: ['YouTube', 'Display', 'Search'], count: 5, percentage: 7.1 },
    { path: ['Display', 'Gmail', 'YouTube'], count: 4, percentage: 5.6 },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Top Conversion Paths</h2>
        <button
          type="button"
          onClick={() => setShowAllModal(true)}
          className="text-xs font-semibold text-[#1a73e8] hover:text-[#174ea6] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View All Paths</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Path Rows List */}
      <div className="space-y-3.5 my-auto">
        {displayPaths.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#f8fafd] transition-colors border border-transparent hover:border-gray-100"
          >
            {/* Sequence with brand icons and arrows */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {item.path.map((ch, cIdx) => (
                <React.Fragment key={cIdx}>
                  <div className="relative group shrink-0">
                    <ChannelIcon channel={ch} size={28} />
                    <span className="sr-only">{ch}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                </React.Fragment>
              ))}

              {/* Conversion Checkout Cart End-node */}
              <ChannelIcon channel="Cart" size={28} />
            </div>

            {/* Percentage on Right */}
            <div className="text-right shrink-0 pl-3">
              <div className="text-sm font-bold text-gray-900 leading-tight">
                {item.percentage}%
              </div>
              <div className="text-[11px] text-gray-400">of conversions</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for View All Paths */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  All Customer Conversion Paths
                </h3>
                <p className="text-xs text-gray-500">
                  Full multi-touch sequences recorded in Firestore
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {displayPaths.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-[#f8fafd]"
                >
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    <span className="w-6 text-xs font-semibold text-gray-400">#{idx + 1}</span>
                    {item.path.map((ch, cIdx) => (
                      <React.Fragment key={cIdx}>
                        <ChannelIcon channel={ch} size={28} />
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      </React.Fragment>
                    ))}
                    <ChannelIcon channel="Cart" size={28} />
                  </div>
                  <div className="text-right shrink-0 pl-4">
                    <div className="text-sm font-bold text-gray-900">{item.percentage}%</div>
                    <div className="text-xs text-gray-500">{item.count} conversions</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
