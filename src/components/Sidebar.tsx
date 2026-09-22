import React from 'react';
import {
  LayoutGrid,
  GitFork,
  BarChart2,
  Layers,
  Users,
  Sparkles,
  FileText,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'journeys', label: 'Customer Journeys', icon: GitFork },
    { id: 'attribution', label: 'Attribution Analysis', icon: BarChart2 },
    { id: 'channels', label: 'Channel Performance', icon: Layers },
    { id: 'audiences', label: 'Audience Insights', icon: Users },
    { id: 'recommendations', label: 'AI Recommendations', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* Top Navigation */}
      <div className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-[#e8f0fe] text-[#1a73e8] font-semibold shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1a73e8]' : 'text-gray-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Controls & Footer */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
            activeTab === 'settings'
              ? 'bg-[#e8f0fe] text-[#1a73e8] font-semibold shadow-2xs'
              : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
          }`}
        >
          <Settings className={`w-4 h-4 shrink-0 ${activeTab === 'settings' ? 'text-[#1a73e8]' : 'text-gray-500'}`} />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('help')}
          className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
            activeTab === 'help'
              ? 'bg-[#e8f0fe] text-[#1a73e8] font-semibold shadow-2xs'
              : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
          }`}
        >
          <HelpCircle className={`w-4 h-4 shrink-0 ${activeTab === 'help' ? 'text-[#1a73e8]' : 'text-gray-500'}`} />
          <span>Help & Feedback</span>
        </button>

        {/* Google Project Badge */}
        <div className="pt-3 px-2">
          <p className="text-[11px] text-gray-400 leading-tight">
            Built for a more insightful next step.
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="text-[11px] font-medium text-gray-500">
              Google Sponsored Project
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
