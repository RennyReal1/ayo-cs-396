import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Users,
  Layers,
  Filter,
  GitFork,
  Zap,
  ListFilter,
  Sparkles,
} from 'lucide-react';
import { UserJourney, Touchpoint, ChannelName, MotiveType } from '../../types';
import { ChannelIcon } from '../ChannelIcon';
import {
  extractUserJourneys,
  CHANNELS,
  CHANNEL_COLORS,
  classifyJourneyMotive,
} from '../../utils/dataEngine';
import { SequenceExplorer } from '../SequenceExplorer';
import { ConversionLagCard } from '../ConversionLagCard';
import { MotiveAnalysisCard } from '../MotiveAnalysisCard';

interface CustomerJourneysPageProps {
  touchpoints: Touchpoint[];
}

export const CustomerJourneysPage: React.FC<CustomerJourneysPageProps> = ({ touchpoints }) => {
  const [activeSubTab, setActiveSubTab] = useState<'sequence' | 'motives' | 'lag' | 'table'>('sequence');
  const [search, setSearch] = useState('');
  const [conversionFilter, setConversionFilter] = useState<'all' | 'converted' | 'non-converted'>('all');
  const [selectedChannel, setSelectedChannel] = useState<ChannelName | 'all'>('all');
  const [selectedLagBucket, setSelectedLagBucket] = useState<string | null>(null);
  const [selectedMotive, setSelectedMotive] = useState<MotiveType | 'all'>('all');
  const [collapseConsecutive, setCollapseConsecutive] = useState(false);
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Toggle user path expansion
  const toggleExpandUser = (userId: string) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  // Extract journeys from touchpoints
  const journeys = useMemo(() => {
    return extractUserJourneys(touchpoints);
  }, [touchpoints]);

  // Compute days to convert helper
  const getDaysToConvertNumeric = (j: UserJourney): number | null => {
    if (!j.converted) return null;
    const start = new Date(j.first_timestamp).getTime();
    const end = new Date(j.last_timestamp).getTime();
    if (isNaN(start) || isNaN(end)) return null;
    return Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
  };

  const getDaysToConvert = (j: UserJourney) => {
    const days = getDaysToConvertNumeric(j);
    if (days === null) return '—';
    if (days < 1) return '< 1 day';
    if (Math.round(days) === 1) return '1 day';
    return `${Math.round(days)} days`;
  };

  // Filter journeys
  const filteredJourneys = useMemo(() => {
    return journeys.filter((j) => {
      // Conversion filter
      if (conversionFilter === 'converted' && !j.converted) return false;
      if (conversionFilter === 'non-converted' && j.converted) return false;

      // Channel filter
      if (selectedChannel !== 'all' && !j.path.includes(selectedChannel)) {
        return false;
      }

      // Motive filter
      if (selectedMotive !== 'all') {
        const m = classifyJourneyMotive(j);
        if (m !== selectedMotive) return false;
      }

      // Latency bucket filter
      if (selectedLagBucket) {
        if (!j.converted) return false;
        const days = getDaysToConvertNumeric(j);
        if (days === null) return false;

        if (selectedLagBucket === 'day_0' && days >= 1) return false;
        if (selectedLagBucket === 'days_1_3' && (days < 1 || days >= 3)) return false;
        if (selectedLagBucket === 'days_4_7' && (days < 3 || days >= 7)) return false;
        if (selectedLagBucket === 'days_8_14' && (days < 7 || days >= 14)) return false;
        if (selectedLagBucket === 'days_15_plus' && days < 14) return false;
      }

      // Search filter (User ID or Channel path)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesUser = j.user_id.toLowerCase().includes(query);
        const matchesPath = j.path.some((ch) => ch.toLowerCase().includes(query));
        if (!matchesUser && !matchesPath) return false;
      }
      return true;
    });
  }, [journeys, search, conversionFilter, selectedChannel, selectedLagBucket, selectedMotive]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredJourneys.length / pageSize));
  const paginatedJourneys = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJourneys.slice(start, start + pageSize);
  }, [filteredJourneys, currentPage, pageSize]);

  // KPI summaries
  const totalConverted = journeys.filter((j) => j.converted).length;
  const totalRevenue = journeys.reduce((sum, j) => sum + j.total_value, 0);
  const avgTouchpoints =
    journeys.length > 0
      ? (journeys.reduce((s, j) => s + j.journey_length, 0) / journeys.length).toFixed(1)
      : '0';

  // Handle clicking a bucket in ConversionLagCard
  const handleBucketFilter = (bucketId: string | null) => {
    setSelectedLagBucket(bucketId);
    if (bucketId) {
      setActiveSubTab('table');
      setCurrentPage(1);
    }
  };

  // Handle clicking a motive card in MotiveAnalysisCard
  const handleMotiveFilter = (motive: MotiveType | 'all') => {
    setSelectedMotive(motive);
    if (motive !== 'all') {
      setActiveSubTab('table');
      setCurrentPage(1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Customer Journeys & Path Sequence Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-[#1a73e8]">
              Cross-Channel
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Analyze multi-touch progression patterns, purchase motives (Birthday, Coachella festival, impulse), conversion velocity, and individual records.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-[#f1f3f4] p-1 rounded-xl text-xs font-semibold flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('sequence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'sequence'
                ? 'bg-white text-[#1a73e8] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>If Channel A → Then B</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('motives')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'motives'
                ? 'bg-white text-[#9334e8] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Purchase Motives (Birthday, Coachella)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('lag')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'lag'
                ? 'bg-white text-[#b06000] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time to Convert</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'table'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Journey Records ({filteredJourneys.length})</span>
          </button>
        </div>
      </div>

      {/* Global Quick Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Users Tracked</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {journeys.length.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Converted Users</p>
            <p className="text-2xl font-bold text-[#137333] mt-0.5">
              {totalConverted.toLocaleString()}
              <span className="text-xs font-normal text-gray-400 ml-1.5">
                (
                {journeys.length > 0
                  ? ((totalConverted / journeys.length) * 100).toFixed(1)
                  : 0}
                %)
              </span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Tracked Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#fef7e0] text-[#b06000] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Avg Touches / User</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{avgTouchpoints}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#f3e8fd] text-[#9334e8] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub-tab 1: Interactive If Channel A -> Then Channel B Explorer */}
      {activeSubTab === 'sequence' && (
        <SequenceExplorer
          journeys={journeys}
          onSelectJourney={(j) => {
            setSearch(j.user_id);
            setActiveSubTab('table');
          }}
        />
      )}

      {/* Sub-tab 2: Purchase Motives & Basket Value */}
      {activeSubTab === 'motives' && (
        <MotiveAnalysisCard
          journeys={journeys}
          selectedMotive={selectedMotive}
          onSelectMotive={handleMotiveFilter}
        />
      )}

      {/* Sub-tab 3: Time to Convert (Conversion Lag & Latency) */}
      {activeSubTab === 'lag' && (
        <ConversionLagCard
          journeys={journeys}
          selectedBucketId={selectedLagBucket}
          onFilterByBucket={handleBucketFilter}
        />
      )}

      {/* Sub-tab 4: Journey Records Table */}
      {activeSubTab === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          {/* Active Filter Pill Alert */}
          {(selectedLagBucket || selectedChannel !== 'all' || selectedMotive !== 'all') && (
            <div className="px-4 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-3.5 h-3.5 text-[#1a73e8]" />
                <span>
                  Filtering active:{' '}
                  {selectedChannel !== 'all' && (
                    <strong className="mr-2">Channel: {selectedChannel}</strong>
                  )}
                  {selectedMotive !== 'all' && (
                    <strong className="mr-2">Motive: {selectedMotive}</strong>
                  )}
                  {selectedLagBucket && (
                    <strong>
                      Latency Window:{' '}
                      {selectedLagBucket === 'day_0'
                        ? '< 24 Hours'
                        : selectedLagBucket === 'days_1_3'
                        ? '1 – 3 Days'
                        : selectedLagBucket === 'days_4_7'
                        ? '4 – 7 Days'
                        : selectedLagBucket === 'days_8_14'
                        ? '8 – 14 Days'
                        : '15+ Days'}
                    </strong>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedChannel('all');
                  setSelectedLagBucket(null);
                  setSelectedMotive('all');
                }}
                className="font-semibold text-[#1a73e8] hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Table Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[200px] max-w-sm flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search user ID (e.g. user_042) or channel..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#f8fafd] hover:bg-[#f1f3f4] focus:bg-white text-xs text-gray-800 placeholder-gray-400 rounded-xl pl-9 pr-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8] transition-all"
                />
              </div>

              {/* Channel filter dropdown */}
              <select
                value={selectedChannel}
                onChange={(e) => {
                  setSelectedChannel(e.target.value as ChannelName | 'all');
                  setCurrentPage(1);
                }}
                className="bg-[#f8fafd] text-xs font-medium text-gray-700 rounded-xl px-3 py-2 border border-gray-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Channels</option>
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>

              {/* Motive filter dropdown */}
              <select
                value={selectedMotive}
                onChange={(e) => {
                  setSelectedMotive(e.target.value as MotiveType | 'all');
                  setCurrentPage(1);
                }}
                className="bg-[#f8fafd] text-xs font-medium text-gray-700 rounded-xl px-3 py-2 border border-gray-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Motives</option>
                <option value="Birthday & Milestone Gift">🎂 Birthday & Gift</option>
                <option value="Festival & Event Prep">🎟️ Festival / Coachella Prep</option>
                <option value="Impulse Flash Sale">⚡ Impulse Flash Sale</option>
                <option value="High-Ticket Deliberation">🔬 High-Ticket Deliberation</option>
                <option value="Routine Replenishment">🔄 Routine Replenishment</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#f1f3f4] p-0.5 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setConversionFilter('all');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    conversionFilter === 'all'
                      ? 'bg-white text-gray-900 font-semibold shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({journeys.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConversionFilter('converted');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    conversionFilter === 'converted'
                      ? 'bg-white text-[#137333] font-semibold shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Converted ({totalConverted})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConversionFilter('non-converted');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    conversionFilter === 'non-converted'
                      ? 'bg-white text-gray-900 font-semibold shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Did Not Convert ({journeys.length - totalConverted})
                </button>
              </div>

              {/* Collapse Consecutive Repeated Touches Toggle */}
              <button
                type="button"
                onClick={() => setCollapseConsecutive(!collapseConsecutive)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  collapseConsecutive
                    ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                title="Group repeated consecutive touches (e.g. Search 3x instead of Search -> Search -> Search)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{collapseConsecutive ? 'Repeats Grouped (3x)' : 'Collapse Repeats'}</span>
              </button>
            </div>
          </div>

          {/* The Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-[#f8fafd] text-gray-600 font-semibold">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Purchase Motive</th>
                  <th className="py-3 px-4">Channel Path Sequence</th>
                  <th className="py-3 px-4 text-center">Touches</th>
                  <th className="py-3 px-4">Time to Convert</th>
                  <th className="py-3 px-4 text-center">Converted</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedJourneys.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No customer journeys match your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedJourneys.map((j) => {
                    const motive = classifyJourneyMotive(j);

                    return (
                      <tr key={j.user_id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-gray-800">
                          {j.user_id}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f1f3f4] text-gray-700">
                            {motive === 'Birthday & Milestone Gift' && '🎂 Birthday'}
                            {motive === 'Festival & Event Prep' && '🎟️ Festival'}
                            {motive === 'Impulse Flash Sale' && '⚡ Impulse'}
                            {motive === 'High-Ticket Deliberation' && '🔬 High-Ticket'}
                            {motive === 'Routine Replenishment' && '🔄 Loyal Repeat'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {(() => {
                            const rawItems: { channel: ChannelName; count: number }[] = [];
                            if (collapseConsecutive) {
                              for (const ch of j.path) {
                                if (rawItems.length > 0 && rawItems[rawItems.length - 1].channel === ch) {
                                  rawItems[rawItems.length - 1].count++;
                                } else {
                                  rawItems.push({ channel: ch, count: 1 });
                                }
                              }
                            } else {
                              for (const ch of j.path) {
                                rawItems.push({ channel: ch, count: 1 });
                              }
                            }

                            const isExpanded = expandedUserIds.has(j.user_id);
                            const visibleItems = isExpanded ? rawItems : rawItems.slice(0, 5);
                            const hiddenCount = rawItems.length - visibleItems.length;

                            return (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {visibleItems.map((item, idx) => (
                                  <React.Fragment key={idx}>
                                    {idx > 0 && <span className="text-gray-300 text-[10px]">→</span>}
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border"
                                      style={{
                                        borderColor: `${CHANNEL_COLORS[item.channel]}30`,
                                        backgroundColor: `${CHANNEL_COLORS[item.channel]}10`,
                                        color: CHANNEL_COLORS[item.channel],
                                      }}
                                    >
                                      <ChannelIcon channel={item.channel} size={14} />
                                      <span>{item.channel}</span>
                                      {item.count > 1 && (
                                        <span className="font-bold text-[10px] px-1 py-0.2 rounded bg-black/10">
                                          {item.count}x
                                        </span>
                                      )}
                                    </span>
                                  </React.Fragment>
                                ))}

                                {hiddenCount > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpandUser(j.user_id)}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
                                  >
                                    +{hiddenCount} more
                                  </button>
                                )}

                                {isExpanded && rawItems.length > 5 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpandUser(j.user_id)}
                                    className="text-[10px] font-semibold text-gray-500 hover:text-gray-800 cursor-pointer underline ml-1"
                                  >
                                    Show less
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-medium text-[11px]">
                            {j.journey_length}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                          {j.converted ? (
                            <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {getDaysToConvert(j)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {j.converted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6f4ea] text-[#137333]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                              <XCircle className="w-3.5 h-3.5 text-gray-400" />
                              No
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                          {j.converted && j.total_value > 0 ? (
                            <span className="text-gray-900">${j.total_value.toFixed(0)}</span>
                          ) : (
                            <span className="text-gray-400 font-normal">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
            <div>
              Showing{' '}
              <span className="font-semibold">
                {filteredJourneys.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
              </span>{' '}
              to{' '}
              <span className="font-semibold">
                {Math.min(currentPage * pageSize, filteredJourneys.length)}
              </span>{' '}
              of <span className="font-semibold">{filteredJourneys.length}</span> customer journeys
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
