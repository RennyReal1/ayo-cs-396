import { ChannelRule, ChannelName } from '../types';

const STORAGE_KEY = 'mira_channel_segmentation_rules';

export const DEFAULT_CHANNEL_RULES: ChannelRule[] = [
  {
    id: 'rule_search',
    channelName: 'Search',
    color: '#1a73e8', // Google Blue
    description: 'Paid search, keyword bidding (Google Ads, Bing) & organic search intent',
    isCore: true,
    matchType: 'contains',
    patterns: [
      'search',
      'cpc',
      'google search',
      'google / cpc',
      'bing',
      'paid search',
      'adwords',
      'organic search',
      'sem',
    ],
    priority: 1,
  },
  {
    id: 'rule_video',
    channelName: 'YouTube',
    color: '#ea4335', // Google Red
    description: 'Video streaming, YouTube ads, short-form video reels, TikTok & CTV',
    isCore: true,
    matchType: 'contains',
    patterns: [
      'youtube',
      'video',
      'tiktok',
      'reels',
      'shorts',
      'vimeo',
      'ctv',
      'ott',
      'yt',
      'bumper',
    ],
    priority: 2,
  },
  {
    id: 'rule_display',
    channelName: 'Display',
    color: '#34a853', // Google Green
    description: 'Visual banner display ads, GDN, programmatic retargeting & network ads',
    isCore: true,
    matchType: 'contains',
    patterns: [
      'display',
      'banner',
      'gdn',
      'retargeting',
      'criteo',
      'programmatic',
      'network',
      'adroll',
      'native',
    ],
    priority: 3,
  },
  {
    id: 'rule_discover',
    channelName: 'Discover',
    color: '#ff6d01', // Google Orange
    description: 'Google Discover feed, social media feeds (Instagram, Meta, Facebook)',
    isCore: false,
    matchType: 'contains',
    patterns: [
      'discover',
      'social',
      'instagram',
      'facebook',
      'meta',
      'feed',
      'pinterest',
      'twitter',
      'x.com',
      'linkedin',
    ],
    priority: 4,
  },
  {
    id: 'rule_email',
    channelName: 'Gmail',
    color: '#4285f4', // Google Sky
    description: 'Gmail sponsored promotions, email marketing newsletters, CRM & Klaviyo',
    isCore: false,
    matchType: 'contains',
    patterns: [
      'email',
      'gmail',
      'newsletter',
      'klaviyo',
      'mailchimp',
      'crm',
      'promo',
      'flow',
      'drip',
    ],
    priority: 5,
  },
  {
    id: 'rule_direct',
    channelName: 'Direct',
    color: '#5f6368', // Neutral Gray
    description: 'Direct browser visits, typed URLs, untracked bookmarks & organic traffic',
    isCore: false,
    matchType: 'contains',
    patterns: [
      'direct',
      'none',
      '(direct) / (none)',
      'typed',
      'bookmark',
      'referral',
      'organic',
    ],
    priority: 6,
  },
];

/**
 * Get active channel segmentation rules from localStorage or defaults
 */
export function getChannelRules(): ChannelRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => a.priority - b.priority);
      }
    }
  } catch (err) {
    console.error('Failed to load custom channel rules from storage:', err);
  }
  return DEFAULT_CHANNEL_RULES;
}

/**
 * Save updated channel rules to storage
 */
export function saveChannelRules(rules: ChannelRule[]): void {
  try {
    const sorted = [...rules].sort((a, b) => a.priority - b.priority);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  } catch (err) {
    console.error('Failed to save channel rules:', err);
  }
}

/**
 * Dynamically segment a raw incoming channel string using the configured rules
 */
export function segmentTouchpointChannel(
  rawChannelStr: string,
  rules: ChannelRule[] = getChannelRules()
): ChannelName {
  if (!rawChannelStr) return 'Direct';
  const input = rawChannelStr.trim().toLowerCase();

  for (const rule of rules) {
    for (const pat of rule.patterns) {
      const pattern = pat.trim().toLowerCase();
      if (!pattern) continue;

      if (rule.matchType === 'exact') {
        if (input === pattern) {
          return rule.channelName;
        }
      } else if (rule.matchType === 'starts_with') {
        if (input.startsWith(pattern)) {
          return rule.channelName;
        }
      } else if (rule.matchType === 'regex') {
        try {
          const reg = new RegExp(pat, 'i');
          if (reg.test(rawChannelStr)) {
            return rule.channelName;
          }
        } catch {
          // If regex is invalid, skip
        }
      } else {
        // Default: contains
        if (input.includes(pattern)) {
          return rule.channelName;
        }
      }
    }
  }

  // Fallback
  return 'Direct';
}

/**
 * Test a raw string against current rules to show the marketer what it matched
 */
export interface MatchTestResult {
  matchedRule: ChannelRule | null;
  matchedPattern: string | null;
  resultingChannel: ChannelName;
  color: string;
}

export function testChannelMatch(
  rawInput: string,
  rules: ChannelRule[] = getChannelRules()
): MatchTestResult {
  if (!rawInput.trim()) {
    return {
      matchedRule: null,
      matchedPattern: null,
      resultingChannel: 'Direct',
      color: '#5f6368',
    };
  }

  const input = rawInput.trim().toLowerCase();

  for (const rule of rules) {
    for (const pat of rule.patterns) {
      const pattern = pat.trim().toLowerCase();
      if (!pattern) continue;

      let isMatch = false;
      if (rule.matchType === 'exact') {
        isMatch = input === pattern;
      } else if (rule.matchType === 'starts_with') {
        isMatch = input.startsWith(pattern);
      } else if (rule.matchType === 'regex') {
        try {
          const reg = new RegExp(pat, 'i');
          isMatch = reg.test(rawInput);
        } catch {
          isMatch = false;
        }
      } else {
        isMatch = input.includes(pattern);
      }

      if (isMatch) {
        return {
          matchedRule: rule,
          matchedPattern: pat,
          resultingChannel: rule.channelName,
          color: rule.color,
        };
      }
    }
  }

  return {
    matchedRule: null,
    matchedPattern: 'No rule matched (fell back to default)',
    resultingChannel: 'Direct',
    color: '#5f6368',
  };
}
