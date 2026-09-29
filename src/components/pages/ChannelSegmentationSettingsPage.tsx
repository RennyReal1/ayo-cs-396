import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Play,
  Save,
  Tag,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { ChannelRule, ChannelName, Touchpoint } from '../../types';
import {
  getChannelRules,
  saveChannelRules,
  DEFAULT_CHANNEL_RULES,
  testChannelMatch,
  MatchTestResult,
  segmentTouchpointChannel,
} from '../../utils/channelSegmentation';
import { ChannelIcon } from '../ChannelIcon';

interface ChannelSegmentationSettingsPageProps {
  touchpoints: Touchpoint[];
  onRulesUpdated?: (updatedRules: ChannelRule[]) => void;
  onShowToast?: (msg: string) => void;
}

export const ChannelSegmentationSettingsPage: React.FC<ChannelSegmentationSettingsPageProps> = ({
  touchpoints,
  onRulesUpdated,
  onShowToast,
}) => {
  const [rules, setRules] = useState<ChannelRule[]>([]);
  const [testInput, setTestInput] = useState('utm_source=meta_video_ad&utm_campaign=coachella');
  const [testResult, setTestResult] = useState<MatchTestResult | null>(null);

  // Modal / Form state for adding/editing a rule
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('#1a73e8');
  const [formDescription, setFormDescription] = useState('');
  const [formMatchType, setFormMatchType] = useState<'contains' | 'regex' | 'exact' | 'starts_with'>('contains');
  const [formPatternInput, setFormPatternInput] = useState('');
  const [formPatterns, setFormPatterns] = useState<string[]>([]);

  // Load rules on mount
  useEffect(() => {
    const loaded = getChannelRules();
    setRules(loaded);
    setTestResult(testChannelMatch(testInput, loaded));
  }, []);

  // Update test result whenever test input or rules change
  useEffect(() => {
    setTestResult(testChannelMatch(testInput, rules));
  }, [testInput, rules]);

  // Open Form to Add New Channel
  const handleOpenAddForm = () => {
    setEditingRuleId(null);
    setFormName('');
    setFormColor('#9334e8');
    setFormDescription('Custom campaign channel grouping');
    setFormMatchType('contains');
    setFormPatterns([]);
    setFormPatternInput('');
    setIsFormOpen(true);
  };

  // Open Form to Edit Existing Rule
  const handleOpenEditForm = (rule: ChannelRule) => {
    setEditingRuleId(rule.id);
    setFormName(rule.channelName);
    setFormColor(rule.color);
    setFormDescription(rule.description || '');
    setFormMatchType(rule.matchType);
    setFormPatterns([...rule.patterns]);
    setFormPatternInput('');
    setIsFormOpen(true);
  };

  // Add pattern chip to form
  const handleAddPattern = () => {
    if (!formPatternInput.trim()) return;
    const clean = formPatternInput.trim().toLowerCase();
    if (!formPatterns.includes(clean)) {
      setFormPatterns([...formPatterns, clean]);
    }
    setFormPatternInput('');
  };

  // Remove pattern chip
  const handleRemovePattern = (pat: string) => {
    setFormPatterns(formPatterns.filter((p) => p !== pat));
  };

  // Save Rule (Create or Update)
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let updatedList: ChannelRule[];
    if (editingRuleId) {
      updatedList = rules.map((r) =>
        r.id === editingRuleId
          ? {
              ...r,
              channelName: formName.trim(),
              color: formColor,
              description: formDescription.trim(),
              matchType: formMatchType,
              patterns: formPatterns,
            }
          : r
      );
    } else {
      const newRule: ChannelRule = {
        id: `rule_custom_${Date.now()}`,
        channelName: formName.trim(),
        color: formColor,
        description: formDescription.trim(),
        matchType: formMatchType,
        patterns: formPatterns,
        priority: rules.length + 1,
      };
      updatedList = [...rules, newRule];
    }

    setRules(updatedList);
    saveChannelRules(updatedList);
    onRulesUpdated?.(updatedList);
    setIsFormOpen(false);
    onShowToast?.(`Channel rule "${formName}" saved successfully!`);
  };

  // Delete a Rule
  const handleDeleteRule = (id: string, name: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    saveChannelRules(updated);
    onRulesUpdated?.(updated);
    onShowToast?.(`Channel rule "${name}" removed.`);
  };

  // Priority Reordering
  const handleMovePriority = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rules.length) return;

    const list = [...rules];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;

    // Re-assign 1-based priority numbers
    const updated = list.map((item, idx) => ({ ...item, priority: idx + 1 }));
    setRules(updated);
    saveChannelRules(updated);
    onRulesUpdated?.(updated);
    onShowToast?.('Rule priority updated.');
  };

  // Reset to Google Defaults
  const handleResetToDefaults = () => {
    setRules(DEFAULT_CHANNEL_RULES);
    saveChannelRules(DEFAULT_CHANNEL_RULES);
    onRulesUpdated?.(DEFAULT_CHANNEL_RULES);
    onShowToast?.('Reset channel segmentation rules to Google default taxonomy.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white rounded-2xl border border-blue-200/80 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1a73e8] text-white">
                <Sliders className="w-3.5 h-3.5" />
                Backend Channel Taxonomy & Rule Manager
              </span>
              <span className="text-xs font-semibold text-gray-500">
                Enterprise Dynamic Segmentation
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1.5">
              Custom Channel Grouping, RegEx & Naming Pattern Rules
            </h2>
            <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
              Every company uses different UTM naming conventions (e.g. <code>google-cpc</code>, <code>meta-video-ad</code>, <code>disp_retargeting</code>). Define how raw incoming URLs and campaign parameters map to your core marketing channels (<strong>Display</strong>, <strong>Video</strong>, <strong>Search</strong>, and custom channels).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Reset rules to default Google Marketing Platform channel taxonomy"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Channel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Matcher Simulator (Test Your UTMs) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-[#1a73e8]" />
            <h3 className="text-sm font-bold text-gray-900">
              Live Pattern Matcher & UTM Simulator
            </h3>
          </div>
          <span className="text-xs text-gray-500">
            Type any raw UTM parameter or channel string to see how Mira segments it in real-time
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="e.g. utm_source=meta_video_ad&utm_medium=reels"
              className="w-full bg-[#f8fafd] text-xs font-mono pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a73e8]"
            />
          </div>

          {/* Result Badge */}
          {testResult && (
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl shrink-0">
              <span className="text-xs text-gray-500 font-medium">Mapped Result:</span>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-2xs"
                style={{ backgroundColor: testResult.color }}
              >
                <ChannelIcon channel={testResult.resultingChannel} size={14} />
                <span>{testResult.resultingChannel}</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                via {testResult.matchedPattern ? `"${testResult.matchedPattern}"` : 'fallback'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Rules Table / Card Grid */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Channel Segmentation Hierarchy ({rules.length} Rules)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Rules are evaluated sequentially in priority order. The first matching rule determines the touchpoint channel.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#137333]" />
            Live Synchronization Active
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {rules.map((rule, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === rules.length - 1;

            return (
              <div
                key={rule.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-[#f8fafd]/60 -mx-2 px-3 rounded-xl transition-colors"
              >
                {/* Channel Header & Priority */}
                <div className="flex items-start gap-3.5">
                  {/* Priority Reordering Buttons */}
                  <div className="flex flex-col items-center gap-0.5 pt-0.5">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMovePriority(idx, 'up')}
                      className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      title="Move Priority Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-gray-400">
                      #{rule.priority}
                    </span>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => handleMovePriority(idx, 'down')}
                      className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      title="Move Priority Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Channel Tag & Description */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: rule.color }}
                      />
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <ChannelIcon channel={rule.channelName as ChannelName} size={16} />
                        <span>{rule.channelName}</span>
                      </h4>
                      {rule.isCore && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-[#1a73e8]">
                          Core Channel
                        </span>
                      )}
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono text-gray-500 bg-gray-100">
                        {rule.matchType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 max-w-xl">
                      {rule.description || 'Custom segmentation channel'}
                    </p>
                  </div>
                </div>

                {/* Patterns Chips */}
                <div className="flex-1 md:max-w-md flex flex-wrap items-center gap-1.5">
                  {rule.patterns.map((pat) => (
                    <span
                      key={pat}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white border border-gray-200/80 text-gray-700 shadow-2xs"
                    >
                      <Tag className="w-2.5 h-2.5 text-gray-400" />
                      <span>{pat}</span>
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenEditForm(rule)}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Edit Rule & Patterns"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {!rule.isCore && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id, rule.channelName)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Custom Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Channel Rule Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white">
              <h3 className="text-sm font-bold text-gray-900">
                {editingRuleId ? 'Edit Channel Rule' : 'Add Custom Channel Rule'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-5 space-y-4">
              {/* Channel Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Channel Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Influencers, Affiliates, SMS"
                  className="w-full bg-[#f8fafd] text-xs font-bold text-gray-900 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              {/* Color & Match Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Badge Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="flex-1 bg-[#f8fafd] text-xs font-mono text-gray-900 px-3 py-1.5 rounded-xl border border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Matching Type
                  </label>
                  <select
                    value={formMatchType}
                    onChange={(e) => setFormMatchType(e.target.value as any)}
                    className="w-full bg-[#f8fafd] text-xs font-semibold text-gray-900 px-3 py-2 rounded-xl border border-gray-200 cursor-pointer"
                  >
                    <option value="contains">Contains (Case-insensitive)</option>
                    <option value="exact">Exact Match</option>
                    <option value="starts_with">Starts With</option>
                    <option value="regex">RegEx Expression</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Description
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Paid influencer partnerships & affiliate tracking links"
                  className="w-full bg-[#f8fafd] text-xs text-gray-700 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              {/* Pattern Chips & Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Keywords & Matching Patterns (UTMs, Sources, URLs)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formPatternInput}
                    onChange={(e) => setFormPatternInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPattern();
                      }
                    }}
                    placeholder="Type keyword and press Add (e.g. affiliate)"
                    className="flex-1 bg-[#f8fafd] text-xs font-mono px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a73e8]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPattern}
                    className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 max-h-32 overflow-y-auto">
                  {formPatterns.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">No patterns added yet.</span>
                  ) : (
                    formPatterns.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-[#1a73e8] border border-blue-200/60 rounded-lg text-xs font-mono"
                      >
                        <span>{p}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePattern(p)}
                          className="text-[#1a73e8] hover:text-red-600 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Channel Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
