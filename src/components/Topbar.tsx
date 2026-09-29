import React, { useState } from 'react';
import { Search, Calendar, ChevronDown, Check, Users, ShieldCheck, Flame, Database, Compass } from 'lucide-react';
import { WorkspaceUser } from '../types';

interface TopbarProps {
  dateRangeLabel?: string;
  selectedDateRange: string;
  onSelectDateRange: (range: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeUser?: WorkspaceUser;
  collaboratorsCount?: number;
  onOpenWorkspaceModal?: () => void;
  activeProjectName?: string;
  activeProjectId?: string;
  activeDatabaseId?: string;
  onOpenProjectModal?: () => void;
  onOpenMarketerGuide?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  dateRangeLabel,
  selectedDateRange,
  onSelectDateRange,
  searchQuery,
  onSearchChange,
  activeUser,
  collaboratorsCount = 2,
  onOpenWorkspaceModal,
  activeProjectName,
  activeProjectId = 'cs-396-mvp-ayo',
  activeDatabaseId,
  onOpenProjectModal,
  onOpenMarketerGuide,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Active label to display on button
  const displayLabel = dateRangeLabel && dateRangeLabel !== 'No touchpoint data' 
    ? dateRangeLabel 
    : selectedDateRange;

  const dateOptions = [
    { key: 'all', label: 'All Touchpoints (Full Period)' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '60d', label: 'Last 60 Days' },
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Brand & App Title */}
      <div className="flex items-center gap-5 shrink-0">
        {/* Google wordmark logo */}
        <div className="flex items-center gap-1.5 select-none" title="Google Marketing Platform">
          <span className="text-2xl font-bold tracking-tight text-[#4285F4]">G</span>
          <span className="text-2xl font-bold tracking-tight text-[#EA4335] -ml-1">o</span>
          <span className="text-2xl font-bold tracking-tight text-[#FBBC05] -ml-1">o</span>
          <span className="text-2xl font-bold tracking-tight text-[#4285F4] -ml-1">g</span>
          <span className="text-2xl font-bold tracking-tight text-[#34A853] -ml-1">l</span>
          <span className="text-2xl font-bold tracking-tight text-[#EA4335] -ml-1">e</span>
        </div>

        <div className="h-8 w-px bg-gray-200 hidden sm:block" />

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-gray-900 tracking-tight">
              Google Mira
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e8f0fe] text-[#1a73e8]">
              Beta
            </span>
          </div>
          <p className="text-xs text-gray-500 hidden md:block">
            Path to Conversion Insights
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden lg:block">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search campaigns, audiences, or channels..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#f8fafd] hover:bg-[#f1f3f4] focus:bg-white text-sm text-gray-800 placeholder-gray-500 rounded-lg pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8] transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Date Range Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 shadow-2xs transition-colors cursor-pointer"
            title={`Active date range: ${displayLabel}`}
          >
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span className="truncate max-w-[180px] sm:max-w-none font-semibold text-gray-800">
              {displayLabel}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                showDatePicker ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Select Reporting Period
              </div>
              {dateOptions.map((opt) => {
                const isSelected =
                  (opt.key === 'all' && (!selectedDateRange.includes('Last 30') && !selectedDateRange.includes('Last 60'))) ||
                  (opt.key === '30d' && selectedDateRange.includes('Last 30')) ||
                  (opt.key === '60d' && selectedDateRange.includes('Last 60'));

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      onSelectDateRange(opt.label);
                      setShowDatePicker(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#e8f0fe]/50 cursor-pointer ${
                      isSelected ? 'text-[#1a73e8] font-medium bg-[#e8f0fe]/30' : 'text-gray-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#1a73e8]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Firebase Project Switcher Chip */}
        <button
          type="button"
          id="firebase-project-topbar-btn"
          onClick={onOpenProjectModal}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafd] hover:bg-[#feefe3]/60 border border-gray-200 hover:border-[#e37400]/40 rounded-xl text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-2xs"
          title={`Active Firebase Target: ${activeProjectName || activeProjectId} (DB: ${activeDatabaseId || 'default'}) - Click to switch project/database`}
        >
          <div className="w-5 h-5 rounded-md bg-[#feefe3] text-[#e37400] flex items-center justify-center shrink-0">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[11px] font-bold text-gray-900 leading-tight flex items-center gap-1.5">
              <span className="truncate max-w-[130px] font-mono">{activeProjectId}</span>
              <span className="w-2 h-2 rounded-full bg-[#137333] shrink-0" title="Connected" />
            </div>
            <div className="text-[9px] text-gray-500 font-mono truncate max-w-[130px]">
              {activeDatabaseId ? (activeDatabaseId === '(default)' ? '(default)' : `${activeDatabaseId.slice(0, 14)}...`) : 'Firestore'}
            </div>
          </div>
        </button>

        {/* Shared Workspace Button */}
        <button
          type="button"
          id="shared-workspace-topbar-btn"
          onClick={onOpenWorkspaceModal}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#f8fafd] hover:bg-[#e8f0fe]/60 border border-gray-200 hover:border-[#1a73e8]/40 rounded-xl text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-2xs"
          title="Shared Team Workspace: ayomide.rilwan4@gmail.com & arilw@uic.edu"
        >
          <div className="flex -space-x-1.5 overflow-hidden">
            <div className="w-5 h-5 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-[9px] ring-2 ring-white">
              AR
            </div>
            <div className="w-5 h-5 rounded-full bg-[#d9381e] text-white flex items-center justify-center font-bold text-[9px] ring-2 ring-white">
              UIC
            </div>
          </div>
          <div className="text-left">
            <span className="text-gray-900 block leading-tight">Shared Workspace</span>
            <span className="text-[10px] text-[#137333] font-medium flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5 inline" /> {collaboratorsCount} Linked Accounts
            </span>
          </div>
        </button>

        {/* Marketer's Guide & Question Finder Button */}
        <button
          type="button"
          onClick={onOpenMarketerGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] border border-blue-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title="Marketer's Guide: 1-click answers to common marketing questions & jargon cheat sheet"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Marketer's Guide</span>
        </button>

        {/* User Avatar / Profile Switcher Trigger */}
        <button
          type="button"
          id="user-profile-trigger"
          onClick={onOpenWorkspaceModal}
          className="flex items-center gap-2.5 pl-2 border-l border-gray-200 hover:opacity-80 transition-opacity cursor-pointer text-left"
          title={`Active User: ${activeUser?.name || 'Ayo'} (${activeUser?.email || 'ayomide.rilwan4@gmail.com'}) - Click to switch or manage workspace`}
        >
          <div
            className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs"
            style={{
              backgroundColor:
                activeUser?.avatarColor ||
                (activeUser?.email?.includes('uic.edu') ? '#d9381e' : '#1a73e8'),
            }}
          >
            {activeUser?.initials || 'AR'}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-semibold text-gray-900 flex items-center gap-1">
              <span>{activeUser?.name || 'Ayo'}</span>
              {activeUser?.email?.includes('uic.edu') && (
                <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-red-100 text-[#d9381e]">
                  UIC
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-500 truncate max-w-[120px]">
              {activeUser?.email || 'ayomide.rilwan4@gmail.com'}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};

