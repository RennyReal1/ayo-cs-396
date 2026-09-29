import React from 'react';
import {
  HelpCircle,
  X,
  Compass,
  DollarSign,
  Calendar,
  Layers,
  Clock,
  Sparkles,
  Presentation,
  CheckCircle2,
  ArrowRight,
  Target,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

interface MarketerQuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tabId: string) => void;
  onOpenUploadModal: () => void;
}

export const MarketerQuickGuideModal: React.FC<MarketerQuickGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenUploadModal,
}) => {
  if (!isOpen) return null;

  const marketingQuestions = [
    {
      q: 'Where should I allocate my ad budget this week?',
      category: 'Budgeting',
      icon: Target,
      color: '#9334e8',
      actionLabel: 'Open Ad Placement Advisor',
      tabId: 'recommendations',
      desc: 'Get an AI-recommended 3-stage budget split (Top, Middle, Bottom funnel) for any product or campaign.',
    },
    {
      q: 'Which channel brings in the most real money (revenue)?',
      category: 'Revenue',
      icon: DollarSign,
      color: '#137333',
      actionLabel: 'View Attribution Revenue',
      tabId: 'attribution',
      desc: 'Compare First-Touch, Linear, and Position-Based models to see which channels actually generate revenue vs. just cheap clicks.',
    },
    {
      q: 'What particular days of the week should I flight my ads?',
      category: 'Flighting',
      icon: Calendar,
      color: '#b06000',
      actionLabel: 'View Flighting Schedule',
      tabId: 'channels',
      desc: 'See which days of the week have the highest purchase conversion rate and discovery browsing volume.',
    },
    {
      q: 'How long does a customer take to buy after seeing our first ad?',
      category: 'Sales Cycle',
      icon: Clock,
      color: '#1a73e8',
      actionLabel: 'View Time to Convert',
      tabId: 'journeys',
      desc: 'Inspect conversion latency (under 24 hours vs. 1–3 days vs. 15+ days) to plan remarketing windows.',
    },
    {
      q: 'How did our Video / Social ads do vs. Search ads?',
      category: 'A/B Channels',
      icon: Layers,
      color: '#d93025',
      actionLabel: 'Open Head-to-Head Duel',
      tabId: 'channels',
      desc: 'Side-by-side comparison of Reach, Assisted Touches, and Closing Power between any two channels.',
    },
    {
      q: 'How do I present these findings to my CMO or executive team?',
      category: 'Reporting',
      icon: Presentation,
      color: '#4285f4',
      actionLabel: 'Generate Google Slides Deck',
      tabId: 'recommendations',
      desc: 'Export a professional 5-slide Google Slides presentation formatted with executive summaries and charts with 1 click.',
    },
  ];

  const glossaryTerms = [
    {
      term: 'Multi-Touch Attribution (MTA)',
      plainEnglish:
        'Instead of giving 100% of the credit to the last Google search ad someone clicked, MTA gives fair credit to every touchpoint (like the YouTube video they saw 2 weeks ago that actually introduced them to your brand).',
    },
    {
      term: 'Position-Based (40-20-40)',
      plainEnglish:
        'Gives 40% of the credit to the first ad that sparked interest, 40% to the closing ad that got the credit card, and splits the remaining 20% across middle nurturing touchpoints.',
    },
    {
      term: 'Conversion Latency (Sales Cycle)',
      plainEnglish:
        'The number of days between when a customer first saw your brand and when they actually made a purchase. Vital for knowing how far in advance to launch event campaigns.',
    },
    {
      term: 'Markov Sequence Prediction',
      plainEnglish:
        'Predicts where customers go next. If someone just watched a YouTube video, it shows the probability that they will search on Google vs. check their email next.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/60 via-purple-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1a73e8] text-white flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  Marketer's Guide & Question Finder
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f0fe] text-[#1a73e8]">
                  Ease of Use
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Quick answers to the most common questions marketing teams ask, with 1-click shortcuts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Question Cards */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#9334e8]" />
              What question are you trying to answer today?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {marketingQuestions.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-gray-200/80 bg-[#f8fafd] hover:bg-white hover:border-[#1a73e8] hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${item.color}15`,
                            color: item.color,
                          }}
                        >
                          {item.category}
                        </span>
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#1a73e8] transition-colors" />
                      </div>

                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#1a73e8] transition-colors leading-snug">
                        "{item.q}"
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToTab(item.tabId);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 bg-white group-hover:bg-[#1a73e8] border border-gray-200 group-hover:border-[#1a73e8] rounded-xl text-xs font-semibold text-gray-700 group-hover:text-white transition-all cursor-pointer shadow-2xs"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Plain-English Marketing Glossary */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-[#137333]" />
              Plain-English Marketing Cheat Sheet (No Math Jargon)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {glossaryTerms.map((g, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-gray-100 bg-[#f8fafd] space-y-1"
                >
                  <h4 className="text-xs font-bold text-gray-900">{g.term}</h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    {g.plainEnglish}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: 3-Step Growth Workflow */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-blue-100 space-y-2">
            <h4 className="text-xs font-bold text-[#1a73e8] uppercase tracking-wider">
              Recommended 3-Step Weekly Workflow for Marketing Teams:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3 rounded-xl border border-blue-100/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-blue-800">Step 1: Check Days</span>
                <p className="text-[11px] text-gray-600">
                  Look at <em>Channel Performance &gt; Flighting</em> to see what days to boost bids.
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-blue-800">Step 2: Plan Creative</span>
                <p className="text-[11px] text-gray-600">
                  Enter your product in <em>AI Recommendations &gt; Placement Advisor</em> for full-funnel budget split.
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-blue-800">Step 3: Export Deck</span>
                <p className="text-[11px] text-gray-600">
                  Click <em>"Export Presentation"</em> to generate an executive Google Slides deck in 1 click.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Need help with custom formats? The CSV uploader auto-detects columns automatically.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold cursor-pointer"
          >
            Got it, take me to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
