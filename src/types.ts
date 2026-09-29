export type ChannelName = 'Search' | 'YouTube' | 'Display' | 'Discover' | 'Gmail' | 'Direct';

export interface Touchpoint {
  id?: string;
  user_id: string;
  channel: ChannelName;
  interaction_sequence: number;
  converted: boolean;
  conversion_value_usd: number;
  timestamp: string; // ISO format
}

export interface UserJourney {
  user_id: string;
  touchpoints: Touchpoint[];
  converted: boolean;
  total_value: number;
  path: ChannelName[];
  journey_length: number;
  first_timestamp: string;
  last_timestamp: string;
}

export interface WeeklyTrendPoint {
  weekKey: string; // e.g. "2024-08-04"
  date: string;
  displayDate: string; // e.g. "Aug 4" or "Aug 4 – 10"
  fullLabel: string; // e.g. "Aug 4 – Aug 10, 2024"
  conversions: number;
  totalInteractions: number;
  conversionRate: number; // percentage, e.g. 4.1
}

// Backward compatibility alias
export type DailyTrendPoint = WeeklyTrendPoint;

export interface ChannelContribution {
  channel: ChannelName;
  conversions: number;
  percentage: number;
  color: string;
}

export interface TopPathItem {
  path: ChannelName[];
  count: number;
  percentage: number;
}

export interface AttributionModelRow {
  model: 'First-Touch' | 'Last-Touch' | 'Linear' | 'Position-Based';
  Search: number;
  YouTube: number;
  Display: number;
  Discover: number;
  Gmail: number;
  Direct: number;
}

export interface PreviousPeriodChanges {
  conversionsPct: number;
  conversionRateDelta: number; // percentage points
  journeyLengthPct: number;
}

export interface DashboardMetrics {
  totalConversions: number;
  totalUsers: number;
  conversionRate: number; // percentage
  avgJourneyLength: number; // average touchpoints
  topChannel: ChannelName;
  topChannelShare: number; // percentage
  totalRevenue: number;
  trendData: WeeklyTrendPoint[]; // Grouped by week
  channelContributions: ChannelContribution[];
  topPaths: TopPathItem[];
  attributionModels: AttributionModelRow[];
  earliestTimestamp?: string;
  latestTimestamp?: string;
  dateRangeLabel: string;
  previousPeriodChanges?: PreviousPeriodChanges | null;
}

export interface AIInsight {
  title: string;
  description: string;
  metric: string;
  category: string;
}

export interface RecommendedAction {
  id: number;
  title: string;
  description: string;
  impact: 'High' | 'Medium';
  timeframe: string;
}

export interface GeminiInsightsResponse {
  insights: AIInsight[];
  recommendations: RecommendedAction[];
}

export interface ChannelPerformanceMetric {
  channel: ChannelName;
  touchpoints: number;
  conversions: number;
  conversionRate: number; // percentage
  revenue: number;
  firstTouchCount: number;
  firstTouchPct: number;
  middleTouchCount: number;
  middleTouchPct: number;
  lastTouchCount: number;
  lastTouchPct: number;
  color: string;
}

export interface JourneyLengthAudiencePoint {
  length: number;
  label: string;
  converters: number;
  nonConverters: number;
  conversionRate: number;
}

export interface ChannelDiversityAudiencePoint {
  channelCount: number;
  label: string;
  converters: number;
  nonConverters: number;
  conversionRate: number;
}

export interface AudienceInsightsData {
  byJourneyLength: JourneyLengthAudiencePoint[];
  byChannelDiversity: ChannelDiversityAudiencePoint[];
  avgLengthConverters: number;
  avgLengthNonConverters: number;
  avgChannelsConverters: number;
  avgChannelsNonConverters: number;
  multiChannelConvRate: number;
  singleChannelConvRate: number;
  liftMultiChannel: number;
}

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Editor' | 'Viewer';
  initials: string;
  avatarColor: string;
  isCurrentUser?: boolean;
  institution?: string;
}

export interface NextTransitionOption {
  target: ChannelName | 'Converted' | 'Dropped Off';
  count: number;
  percentage: number; // 0 to 100
  color: string;
}

export interface SequenceAnalysisResult {
  steps: (ChannelName | 'Any')[];
  matchingJourneysCount: number;
  totalJourneysCount: number;
  shareOfTraffic: number; // percentage
  conversionsCount: number;
  conversionRate: number; // percentage
  baselineConversionRate: number; // percentage
  liftVsBaseline: number; // percentage difference
  totalRevenue: number;
  avgOrderValue: number;
  avgDaysToConvert: number;
  nextStepTransitions: NextTransitionOption[];
  matchingJourneys: UserJourney[];
}

export interface ConversionLagBucket {
  id: string;
  label: string;
  minDays: number;
  maxDays: number;
  conversions: number;
  percentage: number;
  revenue: number;
  avgOrderValue: number;
  description: string;
  color: string;
}

export interface ChannelLagSpeed {
  channel: ChannelName;
  avgDaysToConvert: number;
  firstTouchCount: number;
  totalRevenue: number;
  fastestConversionDays: number;
  color: string;
}

export interface ConversionLagMetrics {
  overallAvgDays: number;
  medianDays: number;
  buckets: ConversionLagBucket[];
  byStartingChannel: ChannelLagSpeed[];
  fastestChannel: ChannelName;
  longestChannel: ChannelName;
  totalConvertedUsers: number;
}

