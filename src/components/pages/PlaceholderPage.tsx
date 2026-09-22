import React from 'react';
import { Settings, HelpCircle, Construction, ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
  iconType?: 'settings' | 'help';
  onBackToOverview?: () => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle,
  iconType = 'settings',
  onBackToOverview,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        <p className="text-xs text-gray-500 mt-1">
          {subtitle || `${title} module configuration and tools`}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-12 border border-gray-200/80 shadow-xs flex flex-col items-center justify-center text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mb-4">
          {iconType === 'settings' ? (
            <Settings className="w-8 h-8 animate-spin-slow" />
          ) : (
            <HelpCircle className="w-8 h-8" />
          )}
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 mb-2">
          Feature in development
        </span>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Coming soon</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
          {iconType === 'settings'
            ? 'Settings and account management preferences are coming soon.'
            : 'Knowledge base, guides, and customer support channels are coming soon.'}
        </p>

        {onBackToOverview && (
          <button
            type="button"
            onClick={onBackToOverview}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Overview</span>
          </button>
        )}
      </div>
    </div>
  );
};
