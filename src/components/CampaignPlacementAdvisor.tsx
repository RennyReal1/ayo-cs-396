import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShoppingBag,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { ChannelName, CampaignPlacementStrategy } from '../types';
import { ChannelIcon } from './ChannelIcon';
import { CHANNEL_COLORS } from '../utils/dataEngine';

interface PresetCampaign {
  id: string;
  name: string;
  category: string;
  pricePoint: number;
  targetAudience: string;
  motive: string;
  budgetTotal: number;
  strategy: CampaignPlacementStrategy;
}

const PRESET_CAMPAIGNS: PresetCampaign[] = [
  {
    id: 'coachella_bag',
    name: 'Coachella Festival Clear Bag',
    category: 'Festival & Event Fashion Accessories',
    pricePoint: 68,
    targetAudience: 'Gen-Z & Millennial Festival Attendees (Ages 18–34)',
    motive: 'Event Preparation & Stadium Policy Compliance',
    budgetTotal: 15000,
    strategy: {
      campaignName: 'Coachella Festival Clear Bag',
      targetAudience: 'Festivalgoers attending Coachella, Stagecoach & summer festivals',
      pricePoint: 68,
      motive: 'Event Prep & Clear Stadium Bag Policy Compliance',
      executiveSummary:
        'For high-energy event merchandise like a Coachella Festival Bag, 80% of intent is created via visual discovery (Video & Social) 4–6 weeks prior, but 70% of transactions close via Search & Direct within 10 days of the festival weekend.',
      adSchedulingTakeaway:
        'Flight visual discovery ads Thu–Sun nights when users plan outfits. Switch to high-bid Search & 2-day delivery guarantees Tuesday–Wednesday before festival weekend 1.',
      stages: [
        {
          stageName: 'Top-of-Funnel (Discovery)',
          budgetSharePct: 45,
          recommendedChannels: ['YouTube', 'Discover'],
          creativeFormat: 'Short-form Video: "What fits in my festival bag" & GRWM outfit styling',
          bestDaysToSend: 'Friday – Sunday (6:00 PM – 11:00 PM)',
          keyMotive: 'Style inspiration & festival excitement',
          rationale:
            'Users are not yet searching for clear bags in February/March; you must spark discovery through festival outfit mood boards and unboxings.',
        },
        {
          stageName: 'Middle-of-Funnel (Consideration)',
          budgetSharePct: 35,
          recommendedChannels: ['Display', 'Gmail'],
          creativeFormat: 'Interactive comparison banners highlighting stadium approval & durability',
          bestDaysToSend: 'Monday – Wednesday (12:00 PM – 3:00 PM)',
          keyMotive: 'Overcoming hesitation & policy verification',
          rationale:
            'Retarget users who viewed the video with proof that the bag passes Coachella 12x6x12" stadium security rules.',
        },
        {
          stageName: 'Bottom-of-Funnel (Conversion)',
          budgetSharePct: 20,
          recommendedChannels: ['Search', 'Direct'],
          creativeFormat: 'High-intent search ads: "Coachella approved bag - 2-day shipping"',
          bestDaysToSend: 'Tuesday – Thursday (Peak checkout velocity)',
          keyMotive: 'Urgency & delivery deadline guarantee',
          rationale:
            'Captures last-minute panicking attendees who need guaranteed delivery before traveling to Indio, California.',
        },
      ],
    },
  },
  {
    id: 'birthday_gift',
    name: 'Personalized Birthday Gift Box',
    category: 'Gifting & Milestone Celebrations',
    pricePoint: 120,
    targetAudience: 'Friends & Family shopping for 21st, 30th & milestone birthdays',
    motive: 'Birthday Celebration & Emotional Connection',
    budgetTotal: 10000,
    strategy: {
      campaignName: 'Personalized Birthday Gift Box',
      targetAudience: 'Gift buyers searching for friends, partners, and siblings',
      pricePoint: 120,
      motive: 'Birthday Milestone & Thoughtful Personalized Gifts',
      executiveSummary:
        'Birthday shoppers have a rigid hard deadline. Email and search dominate last-click purchases, while discovery feeds introduce customized options 14 days in advance.',
      adSchedulingTakeaway:
        'Email newsletter drops perform best Tuesday mornings; Google search retargeting converts highest Thursdays.',
      stages: [
        {
          stageName: 'Top-of-Funnel (Discovery)',
          budgetSharePct: 35,
          recommendedChannels: ['Discover', 'YouTube'],
          creativeFormat: 'Unboxing reactions and artisan engraving behind-the-scenes',
          bestDaysToSend: 'Saturday – Sunday',
          keyMotive: 'Gift inspiration when browsing leisure feeds',
          rationale: 'Inspires buyers looking ahead at their upcoming month calendar of birthdays.',
        },
        {
          stageName: 'Middle-of-Funnel (Consideration)',
          budgetSharePct: 40,
          recommendedChannels: ['Gmail', 'Display'],
          creativeFormat: 'Personalized greeting preview & customer 5-star reviews',
          bestDaysToSend: 'Tuesday & Thursday morning',
          keyMotive: 'Confidence in product quality & packaging',
          rationale: 'Inbox promotions with countdown timer reminders for upcoming birthdays.',
        },
        {
          stageName: 'Bottom-of-Funnel (Conversion)',
          budgetSharePct: 25,
          recommendedChannels: ['Search', 'Direct'],
          creativeFormat: 'Search keywords: "custom birthday box same day ship"',
          bestDaysToSend: 'Monday – Wednesday',
          keyMotive: 'Arrival guarantee before celebration date',
          rationale: 'Searchers have credit card in hand and zero tolerance for shipping delays.',
        },
      ],
    },
  },
  {
    id: 'holiday_luxury',
    name: 'Winter Holiday Fragrance Set',
    category: 'Beauty & Premium Gifting',
    pricePoint: 195,
    targetAudience: 'Holiday luxury shoppers & self-treat purchasers',
    motive: 'Q4 Holiday Gifting & Luxury Indulgence',
    budgetTotal: 25000,
    strategy: {
      campaignName: 'Winter Holiday Fragrance Set',
      targetAudience: 'High-income gifters and luxury perfume collectors',
      pricePoint: 195,
      motive: 'Holiday Prestige & Limited Edition Exclusivity',
      executiveSummary:
        'High ticket luxury items require 4 to 7 touchpoints before conversion. Display and video build aspirational brand equity, while search and email capture the final purchase.',
      adSchedulingTakeaway:
        'Ramp up ad spend between Nov 15 – Dec 18, with heavy weekend video flighting followed by Monday email retargeting.',
      stages: [
        {
          stageName: 'Top-of-Funnel (Discovery)',
          budgetSharePct: 50,
          recommendedChannels: ['YouTube', 'Display'],
          creativeFormat: 'Cinematic holiday campaign with ambient music & bottle aesthetics',
          bestDaysToSend: 'Thursday – Sunday evenings',
          keyMotive: 'Aspirational desire and sensory luxury',
          rationale: 'Creates high perceived value and prestige before price is evaluated.',
        },
        {
          stageName: 'Middle-of-Funnel (Consideration)',
          budgetSharePct: 30,
          recommendedChannels: ['Discover', 'Gmail'],
          creativeFormat: 'Complimentary luxury sample set with purchase & scent profile quiz',
          bestDaysToSend: 'Tuesday & Wednesday',
          keyMotive: 'Risk reduction & scent matching reassurance',
          rationale: 'Helps hesitant gifters pick the right scent notes for their recipient.',
        },
        {
          stageName: 'Bottom-of-Funnel (Conversion)',
          budgetSharePct: 20,
          recommendedChannels: ['Search', 'Direct'],
          creativeFormat: 'Direct search ads: "Official Luxury Perfume Gift Set - Free Gift Wrap"',
          bestDaysToSend: 'Monday – Thursday (Before shipping cutoff)',
          keyMotive: 'Exclusivity, gift wrapping, and authenticity',
          rationale: 'Ensures buyers purchase from official brand instead of unauthorized resellers.',
        },
      ],
    },
  },
];

export const CampaignPlacementAdvisor: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('coachella_bag');
  const [customProduct, setCustomProduct] = useState('');
  const [customPrice, setCustomPrice] = useState(68);
  const [customBudget, setCustomBudget] = useState(15000);

  const activePreset =
    PRESET_CAMPAIGNS.find((p) => p.id === selectedPresetId) || PRESET_CAMPAIGNS[0];
  const strategy = activePreset.strategy;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-50/80 via-indigo-50/40 to-white rounded-2xl border border-purple-200/70 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#9334e8] text-white">
                <Target className="w-3.5 h-3.5" />
                Campaign Placement Advisor
              </span>
              <span className="text-xs font-semibold text-gray-500">
                Where & When Should You Place Your Ad?
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1.5">
              Full-Funnel Ad Placement & Scheduling Intelligence
            </h2>
            <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
              Solve the exact marketing dilemma: given your product, customer motive, and price point, where should you place ads across Top, Middle, and Bottom funnel stages, and on which days of the week?
            </p>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-purple-100 shadow-2xs self-start md:self-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Target Framework
            </span>
            <p className="text-xs font-bold text-[#9334e8] mt-0.5">
              Discovery → Consideration → Conversion
            </p>
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div className="mt-4 pt-3 border-t border-purple-100/70 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">
            Product Scenarios:
          </span>
          {PRESET_CAMPAIGNS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  setCustomPrice(preset.pricePoint);
                  setCustomBudget(preset.budgetTotal);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#9334e8] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#9334e8] hover:text-[#9334e8]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{preset.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  ${preset.pricePoint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campaign Details Summary Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#f8fafd] rounded-xl p-3.5 border border-gray-200/60">
            <span className="text-[11px] font-medium text-gray-500">Selected Product</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{activePreset.name}</p>
            <span className="text-[11px] text-[#9334e8] font-medium">{activePreset.category}</span>
          </div>

          <div className="bg-[#f8fafd] rounded-xl p-3.5 border border-gray-200/60">
            <span className="text-[11px] font-medium text-gray-500">Target Audience</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{activePreset.targetAudience}</p>
            <span className="text-[11px] text-gray-500">Core demographic</span>
          </div>

          <div className="bg-[#f8fafd] rounded-xl p-3.5 border border-gray-200/60">
            <span className="text-[11px] font-medium text-gray-500">Primary Motive</span>
            <p className="text-sm font-bold text-[#1a73e8] mt-0.5">{activePreset.motive}</p>
            <span className="text-[11px] text-gray-500">Psychological trigger</span>
          </div>

          <div className="bg-[#f8fafd] rounded-xl p-3.5 border border-gray-200/60">
            <span className="text-[11px] font-medium text-gray-500">Simulated Budget</span>
            <p className="text-sm font-bold text-[#137333] mt-0.5">
              ${customBudget.toLocaleString()}
            </p>
            <span className="text-[11px] text-gray-500">
              Est. ~{Math.round(customBudget / (customPrice * 0.4))} conversions
            </span>
          </div>
        </div>

        {/* Executive Summary Callout */}
        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#9334e8] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-purple-950">
              Executive Placement Blueprint: {strategy.campaignName}
            </p>
            <p className="text-xs text-purple-900 leading-relaxed">
              {strategy.executiveSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Full-Funnel Placement Blueprint Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1a73e8]" />
            Full-Funnel Ad Placement Strategy (Top, Middle, Bottom)
          </h3>
          <span className="text-xs font-semibold text-gray-400">
            100% Budget Allocated
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {strategy.stages.map((stage, idx) => {
            const isTop = idx === 0;
            const isMid = idx === 1;
            const isBot = idx === 2;
            const stageBudget = Math.round((customBudget * stage.budgetSharePct) / 100);

            return (
              <div
                key={stage.stageName}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  isTop
                    ? 'border-blue-200/80 hover:border-[#1a73e8]'
                    : isMid
                    ? 'border-purple-200/80 hover:border-[#9334e8]'
                    : 'border-emerald-200/80 hover:border-[#137333]'
                }`}
              >
                <div className="space-y-4">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isTop
                            ? 'bg-blue-50 text-[#1a73e8]'
                            : isMid
                            ? 'bg-purple-50 text-[#9334e8]'
                            : 'bg-emerald-50 text-[#137333]'
                        }`}
                      >
                        Funnel Stage #{idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 mt-1">
                        {stage.stageName}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-extrabold text-gray-900">
                        {stage.budgetSharePct}%
                      </span>
                      <p className="text-[10px] text-gray-400 font-medium">
                        ${stageBudget.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Channels */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Where to Place the Ad:
                    </span>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {stage.recommendedChannels.map((ch) => (
                        <div
                          key={ch}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold"
                          style={{
                            borderColor: `${CHANNEL_COLORS[ch]}30`,
                            backgroundColor: `${CHANNEL_COLORS[ch]}10`,
                            color: CHANNEL_COLORS[ch],
                          }}
                        >
                          <ChannelIcon channel={ch} size={16} />
                          <span>{ch}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Creative Angle / Format */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Creative Angle / Ad Format:
                    </span>
                    <p className="text-xs font-medium text-gray-800 mt-1 bg-[#f8fafd] p-2.5 rounded-xl border border-gray-100">
                      {stage.creativeFormat}
                    </p>
                  </div>

                  {/* Best Days to Flight */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#b06000]" />
                      Best Particular Days to Run:
                    </span>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">
                      {stage.bestDaysToSend}
                    </p>
                  </div>

                  {/* Key Motive */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Target Motive:
                    </span>
                    <p className="text-xs text-[#1a73e8] font-semibold mt-0.5">
                      {stage.keyMotive}
                    </p>
                  </div>

                  {/* Why this works */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      <strong>Why this works:</strong> {stage.rationale}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ad Scheduling & Dayparting Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1a73e8]" />
          <h3 className="text-sm font-bold text-gray-900">
            Ad Scheduling & Dayparting Flight Schedule
          </h3>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed bg-[#f8fafd] p-3 rounded-xl border border-gray-200/70">
          💡 <strong>Actionable Dayparting Rule:</strong> {strategy.adSchedulingTakeaway}
        </p>
      </div>
    </div>
  );
};
