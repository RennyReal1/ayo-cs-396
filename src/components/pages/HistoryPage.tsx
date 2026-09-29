import React, { useState } from 'react';
import {
  History,
  GitCommit,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  Users,
  Sparkles,
  Download,
  Presentation,
  Save,
  Clock,
  Filter,
} from 'lucide-react';
import { DashboardMetrics, Touchpoint, WorkspaceUser } from '../../types';
import { PeriodComparisonCard } from '../PeriodComparisonCard';

interface HistoryPageProps {
  metrics: DashboardMetrics;
  touchpoints: Touchpoint[];
  onShowToast?: (msg: string) => void;
  collaborators?: WorkspaceUser[];
}

interface ActivityEvent {
  id: string;
  user: string;
  avatarColor: string;
  initials: string;
  action: string;
  category: 'Upload' | 'Snapshot' | 'AI' | 'Slides' | 'Attribution';
  timestamp: string;
  details: string;
}

const INITIAL_ACTIVITY_LOG: ActivityEvent[] = [
  {
    id: 'act_1',
    user: 'Ayomide Rilwan',
    avatarColor: '#1a73e8',
    initials: 'AR',
    action: 'Saved Historical Snapshot',
    category: 'Snapshot',
    timestamp: 'Today at 12:02 PM',
    details: 'Saved "Q4 Holiday Blitz 2025" benchmark to Firestore with 78 conversions and $28,450 revenue.',
  },
  {
    id: 'act_2',
    user: 'Gemini 2.5 Flash',
    avatarColor: '#9334e8',
    initials: 'AI',
    action: 'Synthesized Recommendations',
    category: 'AI',
    timestamp: 'Today at 11:58 AM',
    details: 'Generated 3 algorithmic cross-channel discoveries and recommended shifting 15% budget to Top-of-Funnel Video.',
  },
  {
    id: 'act_3',
    user: 'Ayomide Rilwan',
    avatarColor: '#1a73e8',
    initials: 'AR',
    action: 'Configured Ad Placement Advisor',
    category: 'Attribution',
    timestamp: 'Today at 11:55 AM',
    details: 'Simulated "Coachella Festival Clear Bag" full-funnel placement (45% Video, 35% Display, 20% Search).',
  },
  {
    id: 'act_4',
    user: 'Ayo (UIC)',
    avatarColor: '#d9381e',
    initials: 'UIC',
    action: 'Generated Google Slides Deck',
    category: 'Slides',
    timestamp: 'Yesterday at 4:30 PM',
    details: 'Exported executive presentation deck with attribution model comparison charts.',
  },
  {
    id: 'act_5',
    user: 'Ayomide Rilwan',
    avatarColor: '#1a73e8',
    initials: 'AR',
    action: 'Uploaded Multi-Channel Touchpoints',
    category: 'Upload',
    timestamp: 'Sep 27, 2026 at 2:15 PM',
    details: 'Synced 300 customer journeys across Search, YouTube, Display, Discover, Gmail, and Direct.',
  },
];

const CAMPAIGN_MILESTONES = [
  {
    period: 'Q4 2025 (Current)',
    title: 'Coachella Festival & Holiday Multi-Touch Blitz',
    highlight: '+34.7% Revenue vs. Q3',
    description:
      'Integrated YouTube short-form styling reels with high-bid Search closing ads. Achieved 26.0% conversion rate with 3.4 days average sales cycle.',
    status: 'Active',
    color: '#137333',
  },
  {
    period: 'Q3 2025',
    title: 'Summer Discovery & Visual Feed Expansion',
    highlight: '22.1% Conv. Rate • $19,840 Rev',
    description:
      'Expanded into Google Discover starburst feeds and Gmail promos. Established baseline consideration lag of 3.8 days.',
    status: 'Archived',
    color: '#1a73e8',
  },
  {
    period: 'Q2 2025',
    title: 'Mid-Year Search & Direct Re-engagement',
    highlight: '19.4% Conv. Rate • $15,200 Rev',
    description:
      'Focused strictly on single-touch search ads. Identified high cart drop-off requiring visual top-of-funnel retargeting.',
    status: 'Archived',
    color: '#b06000',
  },
  {
    period: 'Q1 2025',
    title: 'Initial Multi-Channel Setup & Tracking Launch',
    highlight: '16.8% Conv. Rate • $12,400 Rev',
    description:
      'Initial deployment of Firestore p2c_touchpoints tracking engine. Established first user path tracking architecture.',
    status: 'Baseline',
    color: '#70757a',
  },
];

export const HistoryPage: React.FC<HistoryPageProps> = ({
  metrics,
  touchpoints,
  onShowToast,
  collaborators,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'benchmarks' | 'activity' | 'milestones'>('benchmarks');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>('all');

  const filteredActivity = INITIAL_ACTIVITY_LOG.filter((act) => {
    if (activityCategoryFilter !== 'all' && act.category !== activityCategoryFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Campaign History & Benchmark Timeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e8f0fe] text-[#1a73e8]">
              Cloud History
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Track historical dataset snapshots (Q4 vs. Q3), chronological team audit logs, and strategic marketing milestones over time.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-[#f1f3f4] p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab('benchmarks')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'benchmarks'
                ? 'bg-white text-[#1a73e8] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Quarterly & Monthly Benchmarks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('activity')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'activity'
                ? 'bg-white text-[#9334e8] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Workspace Activity Log</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('milestones')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'milestones'
                ? 'bg-white text-[#137333] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Strategic Milestones</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Period-over-Period Benchmark Comparison */}
      {activeSubTab === 'benchmarks' && (
        <PeriodComparisonCard currentMetrics={metrics} onShowToast={onShowToast} />
      )}

      {/* Sub-tab 2: Workspace Activity Log */}
      {activeSubTab === 'activity' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Workspace Audit Trail & Action History
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Logged interactions, data uploads, model adjustments, and slide exports
                </p>
              </div>

              {/* Filter by Category */}
              <div className="flex items-center gap-1.5 bg-[#f1f3f4] p-1 rounded-xl text-xs">
                {['all', 'Snapshot', 'AI', 'Upload', 'Slides'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActivityCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      activityCategoryFilter === cat
                        ? 'bg-white text-gray-900 font-bold shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {cat === 'all' ? 'All Activity' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredActivity.map((act) => (
                <div key={act.id} className="py-3.5 flex items-start gap-3.5">
                  <div
                    className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
                    style={{ backgroundColor: act.avatarColor }}
                  >
                    {act.initials}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{act.user}</span>
                        <span className="text-xs text-gray-600 font-medium">{act.action}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            act.category === 'Snapshot'
                              ? 'bg-blue-50 text-[#1a73e8]'
                              : act.category === 'AI'
                              ? 'bg-purple-50 text-[#9334e8]'
                              : act.category === 'Upload'
                              ? 'bg-emerald-50 text-[#137333]'
                              : 'bg-amber-50 text-[#b06000]'
                          }`}
                        >
                          {act.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{act.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Strategic Milestones Timeline */}
      {activeSubTab === 'milestones' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Quarterly Marketing Strategy Milestones
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Evolution of attribution models, channel investments, and campaign results over the past 4 quarters
              </p>
            </div>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {CAMPAIGN_MILESTONES.map((m, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Node dot */}
                  <div
                    className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs"
                    style={{ backgroundColor: m.color }}
                  />

                  <div className="p-4 rounded-xl border border-gray-200/80 bg-[#f8fafd] hover:bg-white transition-all space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-gray-500">
                          {m.period}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900">{m.title}</h4>
                      </div>

                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${m.color}15`,
                          color: m.color,
                        }}
                      >
                        {m.highlight}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
