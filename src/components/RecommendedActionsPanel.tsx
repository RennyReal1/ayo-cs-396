import React, { useState } from 'react';
import { Lightbulb, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { RecommendedAction } from '../types';

interface RecommendedActionsPanelProps {
  actions: RecommendedAction[];
}

const BADGE_COLORS = [
  'bg-[#1a73e8]', // Blue
  'bg-[#ea4335]', // Red
  'bg-[#f9ab00]', // Amber / Gold
  'bg-[#34a853]', // Green
];

export const RecommendedActionsPanel: React.FC<RecommendedActionsPanelProps> = ({ actions }) => {
  const [showAllModal, setShowAllModal] = useState(false);

  // Ensure 4 actions
  const displayActions = actions && actions.length >= 4 ? actions.slice(0, 4) : [
    {
      id: 1,
      title: 'Increase investment in Search + YouTube based on strong conversion lift.',
      description: 'Shift 15% of budget to coordinated search-to-video funnels.',
      impact: 'High' as const,
      timeframe: 'Immediate',
    },
    {
      id: 2,
      title: 'Retarget users who have engaged with 2+ channels but haven\'t converted.',
      description: 'Deploy personalized remarketing incentives on Gmail and Display.',
      impact: 'High' as const,
      timeframe: 'Next 14 days',
    },
    {
      id: 3,
      title: 'Test creative variations on Display to improve mid-funnel engagement.',
      description: 'Optimize banner frequency capping and high-impact hero imagery.',
      impact: 'Medium' as const,
      timeframe: 'Q4',
    },
    {
      id: 4,
      title: 'Leverage AI-generated audience segments to identify emerging high-conversion cohorts.',
      description: 'Sync high-value customer profile traits across automated bidding strategies.',
      impact: 'Medium' as const,
      timeframe: 'Ongoing',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#f9ab00]" />
          <h2 className="text-sm font-semibold text-gray-900">Recommended Actions</h2>
        </div>

        <button
          type="button"
          onClick={() => setShowAllModal(true)}
          className="text-xs font-semibold text-[#1a73e8] hover:text-[#174ea6] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>See All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Action Items */}
      <div className="space-y-3.5 my-auto">
        {displayActions.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-[#f8fafd] transition-colors"
          >
            {/* Number badge */}
            <div
              className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                BADGE_COLORS[idx % BADGE_COLORS.length]
              }`}
            >
              {idx + 1}
            </div>

            {/* Action Text */}
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-800 leading-relaxed">
                {item.title}
              </p>
              {item.timeframe && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold text-gray-400">
                    Impact: {item.impact || 'High'}
                  </span>
                  <span className="text-[10px] text-gray-300">•</span>
                  <span className="text-[10px] text-gray-400">
                    Timeframe: {item.timeframe}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for See All */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  All Recommended Campaign Actions
                </h3>
                <p className="text-xs text-gray-500">
                  Prioritized by conversion probability and attribution leverage
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

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {displayActions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-gray-100 bg-[#f8fafd] flex items-start gap-3.5"
                >
                  <div
                    className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      BADGE_COLORS[idx % BADGE_COLORS.length]
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1 text-[#137333] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {item.impact} Impact
                      </span>
                      <span>Target: {item.timeframe}</span>
                    </div>
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
