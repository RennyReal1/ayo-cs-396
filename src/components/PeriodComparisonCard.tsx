import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Save,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CheckCircle2,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  Plus,
} from 'lucide-react';
import { MarketingSnapshot, DashboardMetrics } from '../types';
import {
  saveSnapshotToFirestore,
  fetchSnapshotsFromFirestore,
  deleteSnapshotFromFirestore,
} from '../utils/dataEngine';
import { logActivity } from '../utils/activityLogger';

interface PeriodComparisonCardProps {
  currentMetrics: DashboardMetrics;
  onShowToast?: (msg: string) => void;
}

// Default baseline snapshots if Firestore is empty
const DEFAULT_BASELINE_SNAPSHOTS: MarketingSnapshot[] = [
  {
    id: 'default_q3_summer',
    name: 'Q3 Summer Campaign Benchmark',
    periodLabel: 'Jul 1 – Sep 30, 2025',
    totalUsers: 280,
    totalConversions: 62,
    conversionRate: 22.1,
    totalRevenue: 19840,
    avgJourneyLength: 3.8,
    topChannel: 'Search',
    createdAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 'default_aug_prefall',
    name: 'August Back-to-School Flash',
    periodLabel: 'Aug 1 – Aug 31, 2025',
    totalUsers: 240,
    totalConversions: 54,
    conversionRate: 22.5,
    totalRevenue: 16500,
    avgJourneyLength: 3.5,
    topChannel: 'YouTube',
    createdAt: '2025-09-01T00:00:00Z',
  },
];

export const PeriodComparisonCard: React.FC<PeriodComparisonCardProps> = ({
  currentMetrics,
  onShowToast,
}) => {
  const [snapshots, setSnapshots] = useState<MarketingSnapshot[]>(DEFAULT_BASELINE_SNAPSHOTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [snapshotName, setSnapshotName] = useState<string>('Q4 Holiday Blitz');
  const [periodLabelInput, setPeriodLabelInput] = useState<string>(
    currentMetrics.dateRangeLabel || 'Current 90-Day Period'
  );

  // Period A (Base) & Period B (Comparison)
  const [periodAId, setPeriodAId] = useState<string>('current');
  const [periodBId, setPeriodBId] = useState<string>('default_q3_summer');

  // Load from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadSnapshots() {
      try {
        setIsLoading(true);
        const remote = await fetchSnapshotsFromFirestore();
        if (isMounted) {
          if (remote.length > 0) {
            setSnapshots(remote);
            setPeriodBId(remote[0].id || 'default_q3_summer');
          } else {
            setSnapshots(DEFAULT_BASELINE_SNAPSHOTS);
          }
        }
      } catch (err) {
        console.error('Failed to load snapshots:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSnapshots();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save current active metrics as a snapshot
  const handleSaveSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotName.trim()) return;

    try {
      setIsSaving(true);
      const newSnap: Omit<MarketingSnapshot, 'id'> = {
        name: snapshotName.trim(),
        periodLabel: periodLabelInput.trim() || currentMetrics.dateRangeLabel,
        totalUsers: currentMetrics.totalUsers,
        totalConversions: currentMetrics.totalConversions,
        conversionRate: currentMetrics.conversionRate,
        totalRevenue: currentMetrics.totalRevenue,
        avgJourneyLength: currentMetrics.avgJourneyLength,
        topChannel: currentMetrics.topChannel,
        createdAt: new Date().toISOString(),
      };

      const docId = await saveSnapshotToFirestore(newSnap);
      const created: MarketingSnapshot = { ...newSnap, id: docId };
      setSnapshots((prev) => [created, ...prev]);
      onShowToast?.(`Snapshot "${newSnap.name}" saved to Firestore!`);
      logActivity(
        'Saved Historical Snapshot',
        'Snapshot',
        `Saved "${newSnap.name}" (${newSnap.periodLabel}) with ${newSnap.totalConversions} conversions and $${newSnap.totalRevenue.toLocaleString()} revenue.`
      );
      setSnapshotName('');
    } catch (err) {
      console.error('Error saving snapshot:', err);
      onShowToast?.('Failed to save snapshot to Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete snapshot
  const handleDeleteSnapshot = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id.startsWith('default_')) {
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
      return;
    }

    try {
      await deleteSnapshotFromFirestore(id);
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
      onShowToast?.('Snapshot removed from Firestore.');
    } catch (err) {
      console.error('Failed to delete snapshot:', err);
      onShowToast?.('Failed to delete snapshot.');
    }
  };

  // Convert currentMetrics into a virtual snapshot
  const currentVirtualSnapshot: MarketingSnapshot = useMemo(
    () => ({
      id: 'current',
      name: 'Current Live Dataset',
      periodLabel: currentMetrics.dateRangeLabel || 'Active Live Data',
      totalUsers: currentMetrics.totalUsers,
      totalConversions: currentMetrics.totalConversions,
      conversionRate: currentMetrics.conversionRate,
      totalRevenue: currentMetrics.totalRevenue,
      avgJourneyLength: currentMetrics.avgJourneyLength,
      topChannel: currentMetrics.topChannel,
      createdAt: new Date().toISOString(),
    }),
    [currentMetrics]
  );

  const allAvailablePeriods = useMemo(() => {
    return [currentVirtualSnapshot, ...snapshots];
  }, [currentVirtualSnapshot, snapshots]);

  const snapA =
    allAvailablePeriods.find((p) => p.id === periodAId) || currentVirtualSnapshot;
  const snapB =
    allAvailablePeriods.find((p) => p.id === periodBId) ||
    snapshots[0] ||
    currentVirtualSnapshot;

  // Variances calculation (Period A vs Period B)
  const convPctDiff =
    snapB.totalConversions > 0
      ? ((snapA.totalConversions - snapB.totalConversions) / snapB.totalConversions) * 100
      : 0;

  const convRateDelta = snapA.conversionRate - snapB.conversionRate;

  const revPctDiff =
    snapB.totalRevenue > 0
      ? ((snapA.totalRevenue - snapB.totalRevenue) / snapB.totalRevenue) * 100
      : 0;

  const lengthPctDiff =
    snapB.avgJourneyLength > 0
      ? ((snapA.avgJourneyLength - snapB.avgJourneyLength) / snapB.avgJourneyLength) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-50/70 via-blue-50/40 to-white rounded-2xl border border-teal-200/60 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#007b83] text-white">
                <History className="w-3.5 h-3.5" />
                Period-over-Period Intelligence
              </span>
              <span className="text-xs font-semibold text-gray-500">
                Quarterly & Monthly Benchmarks (Firestore Persisted)
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1.5">
              Historical Dataset & Campaign Period Comparison
            </h2>
            <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
              Save snapshots of your marketing performance across quarters (e.g. Q4 vs. Q3 or Month-over-Month) to track whether channel optimization shortened journey times and lifted ROAS.
            </p>
          </div>
        </div>
      </div>

      {/* Snapshot Save Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Save className="w-4 h-4 text-[#1a73e8]" />
            Save Current Live Dataset as a Firestore Benchmark
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Capture current conversions, revenue, and channel mix for future comparison:
          </p>
        </div>

        <form onSubmit={handleSaveSnapshot} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Snapshot Name (e.g. Q4 Holiday Blitz 2025)"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              className="w-full bg-[#f8fafd] text-xs font-semibold text-gray-900 px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a73e8]"
              required
            />
          </div>

          <div className="flex-1 min-w-[180px]">
            <input
              type="text"
              placeholder="Period Label (e.g. Oct 1 – Dec 31)"
              value={periodLabelInput}
              onChange={(e) => setPeriodLabelInput(e.target.value)}
              className="w-full bg-[#f8fafd] text-xs text-gray-700 px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a73e8]"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving || !snapshotName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Save Snapshot</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Comparison Selector Dropdowns */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">
            Compare Period A vs. Period B
          </h3>
          <span className="text-xs text-gray-500">
            {allAvailablePeriods.length} available benchmark periods
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Period A */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a73e8]">
              Period A (Base)
            </span>
            <select
              value={periodAId}
              onChange={(e) => setPeriodAId(e.target.value)}
              className="w-full text-xs font-bold text-gray-900 bg-white p-2.5 rounded-xl border border-blue-200 focus:outline-none cursor-pointer"
            >
              {allAvailablePeriods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.periodLabel})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500">
              {snapA.totalConversions} conversions • ${snapA.totalRevenue.toLocaleString()} revenue
            </p>
          </div>

          {/* Period B */}
          <div className="p-4 rounded-xl border border-gray-200 bg-[#f8fafd] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Period B (Comparison Baseline)
            </span>
            <select
              value={periodBId}
              onChange={(e) => setPeriodBId(e.target.value)}
              className="w-full text-xs font-bold text-gray-900 bg-white p-2.5 rounded-xl border border-gray-200 focus:outline-none cursor-pointer"
            >
              {allAvailablePeriods.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === periodAId}>
                  {p.name} ({p.periodLabel})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500">
              {snapB.totalConversions} conversions • ${snapB.totalRevenue.toLocaleString()} revenue
            </p>
          </div>
        </div>

        {/* Delta Comparison Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Conversions Delta */}
          <div className="p-4 rounded-xl bg-[#f8fafd] border border-gray-100">
            <span className="text-[11px] font-medium text-gray-500">Total Conversions</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-gray-900">{snapA.totalConversions}</span>
              <span className="text-xs text-gray-400">vs {snapB.totalConversions}</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              {convPctDiff >= 0 ? (
                <span className="text-xs font-bold text-[#137333] flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +{convPctDiff.toFixed(1)}% lift
                </span>
              ) : (
                <span className="text-xs font-bold text-[#d93025] flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {convPctDiff.toFixed(1)}% drop
                </span>
              )}
            </div>
          </div>

          {/* Conversion Rate Delta */}
          <div className="p-4 rounded-xl bg-[#f8fafd] border border-gray-100">
            <span className="text-[11px] font-medium text-gray-500">Conversion Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-gray-900">{snapA.conversionRate}%</span>
              <span className="text-xs text-gray-400">vs {snapB.conversionRate}%</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              {convRateDelta >= 0 ? (
                <span className="text-xs font-bold text-[#137333] flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +{convRateDelta.toFixed(1)} pts
                </span>
              ) : (
                <span className="text-xs font-bold text-[#d93025] flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {convRateDelta.toFixed(1)} pts
                </span>
              )}
            </div>
          </div>

          {/* Total Revenue Delta */}
          <div className="p-4 rounded-xl bg-[#f8fafd] border border-gray-100">
            <span className="text-[11px] font-medium text-gray-500">Total Revenue</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-gray-900">
                ${snapA.totalRevenue.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400">
                vs ${snapB.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              {revPctDiff >= 0 ? (
                <span className="text-xs font-bold text-[#137333] flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +{revPctDiff.toFixed(1)}% revenue
                </span>
              ) : (
                <span className="text-xs font-bold text-[#d93025] flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {revPctDiff.toFixed(1)}% revenue
                </span>
              )}
            </div>
          </div>

          {/* Average Journey Length Delta */}
          <div className="p-4 rounded-xl bg-[#f8fafd] border border-gray-100">
            <span className="text-[11px] font-medium text-gray-500">Avg Touchpoints</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-gray-900">{snapA.avgJourneyLength}</span>
              <span className="text-xs text-gray-400">vs {snapB.avgJourneyLength}</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              {lengthPctDiff <= 0 ? (
                <span className="text-xs font-bold text-[#137333] flex items-center">
                  ⚡ {Math.abs(lengthPctDiff).toFixed(1)}% faster conversion
                </span>
              ) : (
                <span className="text-xs font-bold text-[#b06000] flex items-center">
                  ⏳ +{lengthPctDiff.toFixed(1)}% longer consideration
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Benchmarks Library */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Saved Period Benchmarks in Firestore ({snapshots.length})
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Historical records retained for quarterly and annual auditing
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8fafd] text-gray-600 font-semibold">
                <th className="py-2.5 px-4">Period Name</th>
                <th className="py-2.5 px-4">Date Range</th>
                <th className="py-2.5 px-4 text-center">Conversions</th>
                <th className="py-2.5 px-4 text-center">Conv. Rate</th>
                <th className="py-2.5 px-4 text-center">Avg Touches</th>
                <th className="py-2.5 px-4 text-right">Revenue</th>
                <th className="py-2.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {snapshots.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{s.name}</td>
                  <td className="py-3 px-4 text-gray-500">{s.periodLabel}</td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-800">
                    {s.totalConversions}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-[#137333]">
                    {s.conversionRate}%
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">{s.avgJourneyLength}</td>
                  <td className="py-3 px-4 text-right font-black text-gray-900">
                    ${s.totalRevenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSnapshot(s.id || '', e)}
                      title="Delete snapshot"
                      className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
