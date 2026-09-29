import React, { useState, useEffect } from 'react';
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
  RefreshCw,
} from 'lucide-react';
import { DashboardMetrics, Touchpoint, WorkspaceUser, ActivityEvent, MarketingSnapshot } from '../../types';
import { PeriodComparisonCard } from '../PeriodComparisonCard';
import { getActivityLog } from '../../utils/activityLogger';
import { fetchSnapshotsFromFirestore } from '../../utils/dataEngine';

interface HistoryPageProps {
  metrics: DashboardMetrics;
  touchpoints: Touchpoint[];
  onShowToast?: (msg: string) => void;
  collaborators?: WorkspaceUser[];
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  metrics,
  touchpoints,
  onShowToast,
  collaborators,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'benchmarks' | 'activity' | 'milestones'>('benchmarks');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>('all');
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>([]);
  const [snapshots, setSnapshots] = useState<MarketingSnapshot[]>([]);
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(false);

  // Load activity log and live Firestore snapshots on mount and tab switch
  useEffect(() => {
    setActivityLog(getActivityLog());

    async function loadSnapshots() {
      try {
        setIsLoadingSnapshots(true);
        const remote = await fetchSnapshotsFromFirestore();
        setSnapshots(remote);
      } catch (err) {
        console.error('Failed to load snapshots for history page:', err);
      } finally {
        setIsLoadingSnapshots(false);
      }
    }

    loadSnapshots();
  }, [activeSubTab]);

  const filteredActivity = activityLog.filter((act) => {
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
            <span>Workspace Activity Log ({activityLog.length})</span>
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
            <span>Milestone History</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Period-over-Period Benchmark Comparison */}
      {activeSubTab === 'benchmarks' && (
        <PeriodComparisonCard currentMetrics={metrics} onShowToast={onShowToast} />
      )}

      {/* Sub-tab 2: Workspace Activity Log (Dynamic) */}
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
              {filteredActivity.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No activity found for this category filter.
                </div>
              ) : (
                filteredActivity.map((act) => (
                  <div key={act.id} className="py-3.5 flex items-start gap-3.5">
                    <div
                      className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
                      style={{ backgroundColor: act.avatarColor || '#1a73e8' }}
                    >
                      {act.initials || 'AR'}
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
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Strategic Milestones Timeline (Dynamic from Live Firestore Snapshots) */}
      {activeSubTab === 'milestones' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Marketing Benchmark Milestones (from Firestore)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Saved campaign periods reflecting empirical conversion results and revenue
              </p>
            </div>

            {/* Current Active Dataset Milestone */}
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              <div className="relative group">
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs bg-[#137333]" />
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-emerald-800">
                        {metrics.dateRangeLabel || 'Current Live Period'} (Active)
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">Live Touchpoint Dataset</h4>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#137333]">
                      ${metrics.totalRevenue.toLocaleString()} Revenue • {metrics.totalConversions} Conversions
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Active dataset tracks {metrics.totalUsers.toLocaleString()} users with {metrics.avgJourneyLength.toFixed(1)} avg touches. Top closing channel: <strong>{metrics.topChannel}</strong> ({metrics.topChannelShare.toFixed(1)}% share).
                  </p>
                </div>
              </div>

              {/* Firestore Saved Snapshots */}
              {snapshots.map((s) => (
                <div key={s.id} className="relative group">
                  <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs bg-[#1a73e8]" />
                  <div className="p-4 rounded-xl border border-gray-200/80 bg-[#f8fafd] hover:bg-white transition-all space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-gray-500">
                          {s.periodLabel}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900">{s.name}</h4>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1a73e8]">
                        ${s.totalRevenue.toLocaleString()} Rev • {s.conversionRate}% Rate
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Captured {s.totalConversions} conversions across {s.totalUsers} users ({s.avgJourneyLength} avg touches). Top channel: <strong>{s.topChannel}</strong>.
                    </p>
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
