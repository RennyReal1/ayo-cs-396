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
} from 'lucide-react';
import { UserJourney, Touchpoint } from '../../types';
import { ChannelIcon } from '../ChannelIcon';
import { extractUserJourneys } from '../../utils/dataEngine';

interface CustomerJourneysPageProps {
  touchpoints: Touchpoint[];
}

export const CustomerJourneysPage: React.FC<CustomerJourneysPageProps> = ({ touchpoints }) => {
  const [search, setSearch] = useState('');
  const [conversionFilter, setConversionFilter] = useState<'all' | 'converted' | 'non-converted'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Extract journeys from touchpoints
  const journeys = useMemo(() => {
    return extractUserJourneys(touchpoints);
  }, [touchpoints]);

  // Compute days to convert helper
  const getDaysToConvert = (j: UserJourney) => {
    if (!j.converted) return '—';
    const start = new Date(j.first_timestamp).getTime();
    const end = new Date(j.last_timestamp).getTime();
    if (isNaN(start) || isNaN(end)) return '—';
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return '< 1 day';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  // Filter journeys
  const filteredJourneys = useMemo(() => {
    return journeys.filter((j) => {
      // Conversion filter
      if (conversionFilter === 'converted' && !j.converted) return false;
      if (conversionFilter === 'non-converted' && j.converted) return false;

      // Search filter (User ID or Channel path)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesUser = j.user_id.toLowerCase().includes(query);
        const matchesPath = j.path.some((ch) => ch.toLowerCase().includes(query));
        if (!matchesUser && !matchesPath) return false;
      }
      return true;
    });
  }, [journeys, search, conversionFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredJourneys.length / pageSize));
  const paginatedJourneys = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJourneys.slice(start, start + pageSize);
  }, [filteredJourneys, currentPage, pageSize]);

  // KPI summaries
  const totalConverted = journeys.filter((j) => j.converted).length;
  const totalRevenue = journeys.reduce((sum, j) => sum + j.total_value, 0);
  const avgTouchpoints = journeys.length > 0 ? (journeys.reduce((s, j) => s + j.journey_length, 0) / journeys.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Journeys</h1>
          <p className="text-xs text-gray-500 mt-1">
            Individual user cross-channel paths, interaction sequences, and conversion outcomes
          </p>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Users Tracked</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{journeys.length.toLocaleString()}</p>
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
                ({journeys.length > 0 ? ((totalConverted / journeys.length) * 100).toFixed(1) : 0}%)
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
            <p className="text-2xl font-bold text-gray-900 mt-0.5">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#fef7e0] text-[#b06000] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Avg Touchpoints / User</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{avgTouchpoints}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#f3e8fd] text-[#9334e8] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Table Toolbar: Search & Filter */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
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
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8fafd] text-gray-600 font-semibold">
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Channel Path</th>
                <th className="py-3 px-4 text-center">Touchpoints</th>
                <th className="py-3 px-4">Days to Convert</th>
                <th className="py-3 px-4 text-center">Converted</th>
                <th className="py-3 px-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedJourneys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No customer journeys match your criteria.
                  </td>
                </tr>
              ) : (
                paginatedJourneys.map((j) => (
                  <tr key={j.user_id} className="hover:bg-gray-50/80 transition-colors">
                    {/* User ID */}
                    <td className="py-3 px-4 font-mono font-semibold text-gray-900 whitespace-nowrap">
                      {j.user_id}
                    </td>

                    {/* Channel Path */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {j.path.map((channel, idx) => (
                          <React.Fragment key={idx}>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100/90 text-gray-700 text-[11px] font-medium border border-gray-200/60">
                              <ChannelIcon channel={channel} size={14} />
                              <span>{channel}</span>
                            </span>
                            {idx < j.path.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </td>

                    {/* Touchpoint Count */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {j.journey_length}
                      </span>
                    </td>

                    {/* Days to Convert */}
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

                    {/* Converted Yes/No */}
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

                    {/* Revenue */}
                    <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                      {j.converted && j.total_value > 0 ? (
                        <span className="text-gray-900">${j.total_value.toFixed(0)}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
          <div>
            Showing <span className="font-semibold">{filteredJourneys.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold">{Math.min(currentPage * pageSize, filteredJourneys.length)}</span> of{' '}
            <span className="font-semibold">{filteredJourneys.length}</span> customer journeys
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
    </div>
  );
};
