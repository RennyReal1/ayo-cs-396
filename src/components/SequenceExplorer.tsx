import React, { useState, useMemo } from 'react';
import {
  GitFork,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { UserJourney, ChannelName } from '../types';
import { CHANNELS, CHANNEL_COLORS, computeSequenceAnalysis } from '../utils/dataEngine';
import { ChannelIcon } from './ChannelIcon';

interface SequenceExplorerProps {
  journeys: UserJourney[];
  onSelectJourney?: (journey: UserJourney) => void;
}

export const SequenceExplorer: React.FC<SequenceExplorerProps> = ({
  journeys,
  onSelectJourney,
}) => {
  // Sequence steps state (e.g. ['YouTube', 'Search'])
  const [steps, setSteps] = useState<(ChannelName | 'Any')[]>(['YouTube', 'Search']);

  // Popular preset sequence templates
  const presets: { label: string; steps: (ChannelName | 'Any')[]; tag: string }[] = [
    {
      label: 'Video Discovery → Search Intent',
      steps: ['YouTube', 'Search'],
      tag: 'High Velocity',
    },
    {
      label: 'Display Retargeting → Direct Close',
      steps: ['Display', 'Direct'],
      tag: 'Re-engagement',
    },
    {
      label: 'Discover Feed → YouTube Consideration',
      steps: ['Discover', 'YouTube'],
      tag: 'Brand Affinity',
    },
    {
      label: 'Gmail Promo → Search Validation',
      steps: ['Gmail', 'Search'],
      tag: 'Promotion Driven',
    },
    {
      label: 'Search First-Click → Direct Finish',
      steps: ['Search', 'Direct'],
      tag: 'Intent Capture',
    },
  ];

  // Compute sequence analysis
  const result = useMemo(() => {
    return computeSequenceAnalysis(journeys, steps);
  }, [journeys, steps]);

  // Handle changing a specific step's channel
  const handleStepChange = (index: number, value: ChannelName | 'Any') => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  // Add another step to the funnel
  const handleAddStep = () => {
    if (steps.length < 5) {
      setSteps([...steps, 'Any']);
    }
  };

  // Remove a step
  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      const updated = steps.filter((_, i) => i !== index);
      setSteps(updated);
    }
  };

  // Reset to default
  const handleReset = () => {
    setSteps(['Any']);
  };

  // Clicking a next-transition option appends it as the next step
  const handleBranchClick = (target: ChannelName | 'Converted' | 'Dropped Off') => {
    if (target !== 'Converted' && target !== 'Dropped Off' && steps.length < 5) {
      setSteps([...steps, target]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Presets */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white rounded-2xl border border-blue-100/80 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1a73e8] text-white">
                <GitFork className="w-3.5 h-3.5" />
                Step-by-Step Path Builder
              </span>
              <span className="text-xs font-semibold text-gray-500">
                "If Channel A → Then Channel B"
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1.5">
              Conditional Customer Journey Explorer
            </h2>
            <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
              Construct multi-touch advertising sequences, analyze conversion lift vs. average, and see real branch probabilities showing where customers navigate next.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              Reset Funnel
            </button>
          </div>
        </div>

        {/* Preset Chips */}
        <div className="mt-4 pt-3 border-t border-blue-100/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mr-1">
            Common Patterns:
          </span>
          {presets.map((preset, idx) => {
            const isMatch =
              preset.steps.length === steps.length &&
              preset.steps.every((val, i) => val === steps[i]);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSteps([...preset.steps])}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isMatch
                    ? 'bg-[#1a73e8] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#1a73e8] hover:text-[#1a73e8]'
                }`}
              >
                <span>{preset.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isMatch ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {preset.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The Step-by-Step Sequence Controls Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#f9ab00]" />
            Construct Your Sequence
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Select the channels at each touchpoint to test your multi-touch hypothesis:
          </p>
        </div>

        {/* Steps Flow Ribbon */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-[#f8fafd] rounded-xl border border-gray-200/70">
          {steps.map((step, idx) => {
            const isAny = step === 'Any';
            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div className="flex items-center text-gray-400">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                )}

                <div className="relative group flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-2xs transition-all hover:border-[#1a73e8]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Touchpoint #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {!isAny && <ChannelIcon channel={step as ChannelName} size={20} />}
                      <select
                        value={step}
                        onChange={(e) =>
                          handleStepChange(idx, e.target.value as ChannelName | 'Any')
                        }
                        className="text-xs font-semibold text-gray-800 bg-transparent focus:outline-none cursor-pointer pr-2"
                      >
                        <option value="Any">✨ Any Channel</option>
                        {CHANNELS.map((ch) => (
                          <option key={ch} value={ch}>
                            {ch}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      title="Remove this step"
                      className="text-gray-300 hover:text-red-500 p-1 rounded-md transition-colors cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {steps.length < 5 && (
            <>
              <div className="flex items-center text-gray-300">
                <ArrowRight className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-600 hover:text-[#1a73e8] hover:border-[#1a73e8] hover:bg-blue-50/50 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Step {steps.length + 1}</span>
              </button>
            </>
          )}
        </div>

        {/* Real-Time Metrics for this Sequence */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* Matching Journeys */}
          <div className="bg-[#f8fafd] rounded-xl p-3.5 border border-gray-200/60">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-medium">Matching Users</span>
              <Users className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {result.matchingJourneysCount}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {result.shareOfTraffic}% of total traffic
            </p>
          </div>

          {/* Conversion Rate & Lift */}
          <div className="bg-[#f8fafd] rounded-xl p-3.5 border border-gray-200/60">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-medium">Conversion Rate</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#137333]" />
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {result.conversionRate}%
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              {result.liftVsBaseline >= 0 ? (
                <span className="text-[11px] font-semibold text-[#137333] flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +{result.liftVsBaseline}% vs avg
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-[#d93025] flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                  {result.liftVsBaseline}% vs avg
                </span>
              )}
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-[#f8fafd] rounded-xl p-3.5 border border-gray-200/60">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-medium">Sequence Revenue</span>
              <DollarSign className="w-3.5 h-3.5 text-[#b06000]" />
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              ${result.totalRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {result.conversionsCount} paying orders
            </p>
          </div>

          {/* Avg Order Value */}
          <div className="bg-[#f8fafd] rounded-xl p-3.5 border border-gray-200/60">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-medium">Average Order Value</span>
              <Sparkles className="w-3.5 h-3.5 text-[#9334e8]" />
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              ${result.avgOrderValue}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">per converted buyer</p>
          </div>

          {/* Time to Convert */}
          <div className="bg-[#f8fafd] rounded-xl p-3.5 border border-gray-200/60">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-medium">Avg Days to Convert</span>
              <Clock className="w-3.5 h-3.5 text-[#1a73e8]" />
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {result.avgDaysToConvert}d
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">first-touch to sale</p>
          </div>
        </div>
      </div>

      {/* "Where Do Customers Go Next?" (Markov Branch Predictor) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1a73e8] animate-pulse" />
              <h3 className="text-sm font-bold text-gray-900">
                Where Do Customers Go Next? (Branch Transition Probabilities)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              After reaching <strong>Touchpoint #{steps.length}</strong> in this sequence, here is where users transition next. Click any channel to add it to your path!
            </p>
          </div>
          <span className="text-[11px] text-gray-400 font-medium self-start sm:self-center">
            {result.matchingJourneysCount} users evaluated
          </span>
        </div>

        {/* Transition Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {result.nextStepTransitions.map((trans, idx) => {
            const isConverted = trans.target === 'Converted';
            const isDropped = trans.target === 'Dropped Off';
            const isChannel = !isConverted && !isDropped;

            return (
              <div
                key={idx}
                onClick={() => isChannel && handleBranchClick(trans.target)}
                className={`p-3.5 rounded-xl border transition-all ${
                  isChannel
                    ? 'border-gray-200 bg-[#f8fafd] hover:bg-white hover:border-[#1a73e8] hover:shadow-xs cursor-pointer group'
                    : isConverted
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-red-200 bg-red-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isChannel && (
                      <ChannelIcon channel={trans.target as ChannelName} size={22} />
                    )}
                    {isConverted && <CheckCircle2 className="w-4 h-4 text-[#137333]" />}
                    {isDropped && <XCircle className="w-4 h-4 text-[#d93025]" />}
                    <span
                      className={`text-xs font-bold ${
                        isConverted
                          ? 'text-[#137333]'
                          : isDropped
                          ? 'text-[#d93025]'
                          : 'text-gray-800 group-hover:text-[#1a73e8]'
                      }`}
                    >
                      {trans.target}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-gray-900">
                    {trans.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200/70 h-2 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(3, trans.percentage))}%`,
                      backgroundColor: trans.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
                  <span>{trans.count} users</span>
                  {isChannel && (
                    <span className="text-[10px] font-semibold text-[#1a73e8] opacity-0 group-hover:opacity-100 transition-opacity">
                      + Add Step →
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matching Customer Journeys Log */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Matching Customer Journeys ({result.matchingJourneys.length})
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Live customer records matching your sequence query
            </p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#f8fafd] border-b border-gray-200 text-gray-600 font-semibold z-10">
              <tr>
                <th className="py-2.5 px-4">User ID</th>
                <th className="py-2.5 px-4">Complete Path Taken</th>
                <th className="py-2.5 px-4 text-center">Touches</th>
                <th className="py-2.5 px-4 text-center">Outcome</th>
                <th className="py-2.5 px-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.matchingJourneys.slice(0, 10).map((j) => (
                <tr
                  key={j.user_id}
                  onClick={() => onSelectJourney?.(j)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-4 font-mono font-medium text-gray-800">
                    {j.user_id}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {j.path.map((ch, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <span className="text-gray-300 text-[10px]">→</span>}
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border"
                            style={{
                              borderColor: `${CHANNEL_COLORS[ch]}30`,
                              backgroundColor: `${CHANNEL_COLORS[ch]}10`,
                              color: CHANNEL_COLORS[ch],
                            }}
                          >
                            <ChannelIcon channel={ch} size={14} />
                            {ch}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-medium text-gray-700">
                    {j.journey_length}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {j.converted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e6f4ea] text-[#137333]">
                        <CheckCircle2 className="w-3 h-3" />
                        Converted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
                        <XCircle className="w-3 h-3" />
                        Did Not Convert
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-gray-900">
                    {j.total_value > 0 ? `$${j.total_value}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {result.matchingJourneys.length > 10 && (
          <div className="p-3 text-center border-t border-gray-100 text-[11px] text-gray-500 bg-[#f8fafd]">
            Showing first 10 matching journeys of {result.matchingJourneys.length} total.
          </div>
        )}
      </div>
    </div>
  );
};
