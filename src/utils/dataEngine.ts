import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  ChannelName,
  Touchpoint,
  UserJourney,
  DashboardMetrics,
  WeeklyTrendPoint,
  ChannelContribution,
  TopPathItem,
  AttributionModelRow,
  PreviousPeriodChanges,
  ChannelPerformanceMetric,
  AudienceInsightsData,
  JourneyLengthAudiencePoint,
  ChannelDiversityAudiencePoint,
  SequenceAnalysisResult,
  NextTransitionOption,
  ConversionLagMetrics,
  ConversionLagBucket,
  ChannelLagSpeed,
  DayOfWeekChannelData,
  DayOfWeekSummary,
} from '../types';

export const CHANNELS: ChannelName[] = ['Search', 'YouTube', 'Display', 'Discover', 'Gmail', 'Direct'];

export const CHANNEL_COLORS: Record<ChannelName, string> = {
  Search: '#1a73e8',   // Google Blue
  YouTube: '#ea4335',  // Google Red
  Display: '#fbbc04',  // Google Amber/Yellow
  Discover: '#34a853', // Google Green
  Gmail: '#9334e8',    // Violet / Purple
  Direct: '#70757a',   // Neutral Slate / Gray
};

const COLLECTION_NAME = 'p2c_touchpoints';

/**
 * Compute human-readable date range label from actual earliest and latest timestamps in touchpoints
 */
export function computeDateRangeFromTouchpoints(touchpoints: Touchpoint[]): {
  minTimestamp: string;
  maxTimestamp: string;
  dateRangeLabel: string;
  earliestDate: Date;
  latestDate: Date;
} {
  if (!touchpoints || touchpoints.length === 0) {
    return {
      minTimestamp: '',
      maxTimestamp: '',
      dateRangeLabel: 'No touchpoint data',
      earliestDate: new Date(),
      latestDate: new Date(),
    };
  }

  let minTime = Infinity;
  let maxTime = -Infinity;
  let minIso = touchpoints[0].timestamp;
  let maxIso = touchpoints[0].timestamp;

  for (const tp of touchpoints) {
    const t = new Date(tp.timestamp).getTime();
    if (!isNaN(t)) {
      if (t < minTime) {
        minTime = t;
        minIso = tp.timestamp;
      }
      if (t > maxTime) {
        maxTime = t;
        maxIso = tp.timestamp;
      }
    }
  }

  if (minTime === Infinity || maxTime === -Infinity) {
    return {
      minTimestamp: '',
      maxTimestamp: '',
      dateRangeLabel: 'No touchpoint data',
      earliestDate: new Date(),
      latestDate: new Date(),
    };
  }

  const earliestDate = new Date(minTime);
  const latestDate = new Date(maxTime);

  const formatOpt: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  };

  const startStr = earliestDate.toLocaleDateString('en-US', formatOpt);
  const endStr = latestDate.toLocaleDateString('en-US', formatOpt);

  return {
    minTimestamp: minIso,
    maxTimestamp: maxIso,
    dateRangeLabel: `${startStr} – ${endStr}`,
    earliestDate,
    latestDate,
  };
}

/**
 * Generate realistic fake data for 300 users across 90 days.
 * Rules:
 * - Exactly 300 users (user_001 to user_300)
 * - Each user has between 1 and 8 touchpoints (strictly 1 to 8)
 * - Spread over the 90 days before their last touchpoint
 * - Channels: Search, YouTube, Display, Discover, Gmail, Direct
 * - About 25% of users convert, with conversion_value_usd between $20 and $500, recorded ONLY on the last touchpoint
 */
export function generateRealisticTouchpoints(): Touchpoint[] {
  const touchpoints: Touchpoint[] = [];
  const TOTAL_USERS = 300;
  
  // Anchor end date: 2024-10-31T23:59:59.000Z
  const anchorEndDate = new Date('2024-10-31T23:59:59.000Z');

  for (let u = 1; u <= TOTAL_USERS; u++) {
    const userId = `user_${String(u).padStart(3, '0')}`;
    
    // About 25% of users convert (~75 users)
    const converts = Math.random() < 0.25;
    
    // Exactly 1 to 8 touchpoints per user
    let numTouchpoints = Math.floor(Math.random() * 8) + 1;
    numTouchpoints = Math.max(1, Math.min(8, numTouchpoints));

    // The user's last touchpoint occurs towards the end of the window (0 to 75 days before Oct 31)
    const endOffsetMs = Math.random() * 75 * 24 * 60 * 60 * 1000;
    const lastTouchDate = new Date(anchorEndDate.getTime() - endOffsetMs);

    // Spread earlier touchpoints over the 90 days before their last touchpoint
    const timestamps: Date[] = [];
    if (numTouchpoints === 1) {
      timestamps.push(new Date(lastTouchDate.getTime()));
    } else {
      // Journey duration up to 88 days before last touchpoint
      const journeyDurationDays = Math.min(88, Math.max(1.5, Math.random() * 80 + 2));
      const firstTouchDate = new Date(lastTouchDate.getTime() - journeyDurationDays * 24 * 60 * 60 * 1000);

      const internalOffsets: number[] = [];
      for (let i = 0; i < numTouchpoints - 2; i++) {
        internalOffsets.push(Math.random());
      }
      internalOffsets.sort((a, b) => a - b);

      const spanMs = lastTouchDate.getTime() - firstTouchDate.getTime();
      timestamps.push(new Date(firstTouchDate.getTime()));
      internalOffsets.forEach((ratio) => {
        timestamps.push(new Date(firstTouchDate.getTime() + ratio * spanMs));
      });
      timestamps.push(new Date(lastTouchDate.getTime()));
    }

    // Sort to be strictly chronological
    timestamps.sort((a, b) => a.getTime() - b.getTime());

    // Channel selection per touchpoint sequence
    for (let seq = 1; seq <= numTouchpoints; seq++) {
      const isFirst = seq === 1;
      const isLast = seq === numTouchpoints;

      let channel: ChannelName;
      const rand = Math.random();

      if (isFirst) {
        if (rand < 0.38) channel = 'Search';
        else if (rand < 0.58) channel = 'Display';
        else if (rand < 0.74) channel = 'Discover';
        else if (rand < 0.88) channel = 'YouTube';
        else channel = 'Direct';
      } else if (isLast) {
        if (rand < 0.34) channel = 'Search';
        else if (rand < 0.56) channel = 'Direct';
        else if (rand < 0.76) channel = 'YouTube';
        else if (rand < 0.88) channel = 'Gmail';
        else channel = 'Display';
      } else {
        if (rand < 0.30) channel = 'YouTube';
        else if (rand < 0.52) channel = 'Search';
        else if (rand < 0.70) channel = 'Display';
        else if (rand < 0.84) channel = 'Gmail';
        else if (rand < 0.94) channel = 'Discover';
        else channel = 'Direct';
      }

      // About 25% of users convert, with conversion_value_usd between $20 and $500, recorded ONLY on the last touchpoint
      const isConverted = converts && isLast;
      const conversionValue = isConverted ? Math.round(20 + Math.random() * 480) : 0;

      touchpoints.push({
        user_id: userId,
        channel,
        interaction_sequence: seq,
        converted: isConverted,
        conversion_value_usd: conversionValue,
        timestamp: timestamps[seq - 1].toISOString(),
      });
    }
  }

  // Sort by timestamp
  touchpoints.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return touchpoints;
}

/**
 * Write touchpoints into Firestore using batched writes.
 * Deletes all existing documents in p2c_touchpoints before writing new ones.
 */
export async function seedTouchpointsToFirestore(
  onProgress?: (progress: number, message: string) => void
): Promise<number> {
  const path = COLLECTION_NAME;
  try {
    onProgress?.(5, 'Generating 300 realistic customer journeys (1–8 touchpoints each)...');
    const touchpoints = generateRealisticTouchpoints();

    // 1. Delete ALL existing documents in p2c_touchpoints before writing new ones
    onProgress?.(15, 'Scanning Firestore collection to delete existing touchpoints...');
    let existingSnap = await getDocs(collection(db, path));
    
    while (!existingSnap.empty) {
      const docsToDelete = existingSnap.docs;
      onProgress?.(25, `Deleting ${docsToDelete.length} existing touchpoints from Firestore...`);
      for (let i = 0; i < docsToDelete.length; i += 400) {
        const batch = writeBatch(db);
        const chunk = docsToDelete.slice(i, i + 400);
        chunk.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      // Verify all were deleted
      existingSnap = await getDocs(collection(db, path));
    }

    onProgress?.(35, 'Cleared existing documents. Writing new touchpoints...');

    // 2. Write new touchpoints in batches of 400
    const totalDocs = touchpoints.length;
    const BATCH_SIZE = 400;
    const numBatches = Math.ceil(totalDocs / BATCH_SIZE);

    for (let b = 0; b < numBatches; b++) {
      const batch = writeBatch(db);
      const start = b * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, totalDocs);
      const slice = touchpoints.slice(start, end);

      slice.forEach((tp) => {
        const docRef = doc(collection(db, path));
        batch.set(docRef, tp);
      });

      await batch.commit();
      const pct = Math.round(40 + ((b + 1) / numBatches) * 60);
      onProgress?.(pct, `Saved batch ${b + 1} of ${numBatches} (${end}/${totalDocs} touchpoints)...`);
    }

    onProgress?.(100, `Successfully seeded ${totalDocs} touchpoints for 300 users!`);
    return totalDocs;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Upload arbitrary validated touchpoints into Firestore.
 * Supports 'replace' (clears existing docs) or 'append' (adds to existing docs).
 * Writes in batches of <= 400 documents.
 */
export async function uploadTouchpointsToFirestore(
  touchpoints: Touchpoint[],
  mode: 'replace' | 'append',
  onProgress?: (progress: number, message: string) => void
): Promise<number> {
  const path = COLLECTION_NAME;
  try {
    // 1. If replace mode, delete all existing documents in batches of 400
    if (mode === 'replace') {
      onProgress?.(5, 'Removing existing touchpoints from Firestore collection...');
      let existingSnap = await getDocs(collection(db, path));

      while (!existingSnap.empty) {
        const docsToDelete = existingSnap.docs;
        onProgress?.(15, `Deleting ${docsToDelete.length} existing touchpoints...`);
        for (let i = 0; i < docsToDelete.length; i += 400) {
          const batch = writeBatch(db);
          const chunk = docsToDelete.slice(i, i + 400);
          chunk.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
        existingSnap = await getDocs(collection(db, path));
      }
    }

    const totalDocs = touchpoints.length;
    if (totalDocs === 0) {
      onProgress?.(100, 'No rows to write.');
      return 0;
    }

    // 2. Write new touchpoints in batches of <= 400
    const BATCH_SIZE = 400;
    const numBatches = Math.ceil(totalDocs / BATCH_SIZE);

    for (let b = 0; b < numBatches; b++) {
      const batch = writeBatch(db);
      const start = b * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, totalDocs);
      const slice = touchpoints.slice(start, end);

      slice.forEach((tp) => {
        const docRef = doc(collection(db, path));
        batch.set(docRef, tp);
      });

      await batch.commit();
      const pct = Math.round(((b + 1) / numBatches) * 100);
      onProgress?.(
        pct,
        `Saving batch ${b + 1} of ${numBatches} (${end} of ${totalDocs} touchpoints stored)...`
      );
    }

    onProgress?.(100, `Successfully saved ${totalDocs} touchpoints to p2c_touchpoints!`);
    return totalDocs;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

/**
 * Downloads a starter CSV template with exact expected headers and 3 realistic example rows
 */
export function downloadCsvTemplate(): void {
  const headers = [
    'user_id',
    'channel',
    'interaction_sequence',
    'converted',
    'conversion_value_usd',
    'timestamp',
  ];
  const exampleRows = [
    ['usr_1001', 'Search', '1', 'false', '0', '2026-08-15T09:30:00Z'],
    ['usr_1001', 'YouTube', '2', 'false', '0', '2026-08-18T14:15:00Z'],
    ['usr_1001', 'Direct', '3', 'true', '145', '2026-08-20T11:45:00Z'],
  ];

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...exampleRows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'google_mira_touchpoints_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Fetch all touchpoints from Firestore
 */
export async function fetchTouchpointsFromFirestore(): Promise<Touchpoint[]> {
  const path = COLLECTION_NAME;
  try {
    const snap = await getDocs(collection(db, path));
    const list: Touchpoint[] = [];
    snap.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        user_id: data.user_id,
        channel: data.channel,
        interaction_sequence: Number(data.interaction_sequence),
        converted: Boolean(data.converted),
        conversion_value_usd: Number(data.conversion_value_usd || 0),
        timestamp: String(data.timestamp),
      });
    });

    // Sort by timestamp
    list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Helper to compute high level summary metrics for a list of touchpoints
 */
function computeHighLevelMetrics(tps: Touchpoint[]) {
  if (!tps || tps.length === 0) {
    return { totalConversions: 0, totalUsers: 0, conversionRate: 0, avgJourneyLength: 0 };
  }
  const userMap = new Map<string, Touchpoint[]>();
  tps.forEach((tp) => {
    const arr = userMap.get(tp.user_id) || [];
    arr.push(tp);
    userMap.set(tp.user_id, arr);
  });

  const totalUsers = userMap.size;
  let totalConversions = 0;
  let totalConvertedTouchpoints = 0;

  userMap.forEach((userTps) => {
    const converted = userTps.some((t) => t.converted);
    if (converted) {
      totalConversions += 1;
      totalConvertedTouchpoints += userTps.length;
    }
  });

  const conversionRate = totalUsers > 0 ? (totalConversions / totalUsers) * 100 : 0;
  const avgJourneyLength = totalConversions > 0 ? totalConvertedTouchpoints / totalConversions : 0;

  return { totalConversions, totalUsers, conversionRate, avgJourneyLength };
}

/**
 * Helper to get the start of the week (Sunday) for a given date in UTC
 */
function getSundayOfWeek(d: Date): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0 is Sunday
  date.setUTCDate(date.getUTCDate() - day);
  return date;
}

/**
 * Aggregate touchpoints into structured customer journeys and compute all dashboard metrics
 */
export function computeDashboardMetrics(
  touchpoints: Touchpoint[],
  allTouchpoints?: Touchpoint[]
): DashboardMetrics {
  const dateRangeInfo = computeDateRangeFromTouchpoints(touchpoints);

  if (!touchpoints || touchpoints.length === 0) {
    return {
      totalConversions: 0,
      totalUsers: 0,
      conversionRate: 0,
      avgJourneyLength: 0,
      topChannel: 'Search',
      topChannelShare: 0,
      totalRevenue: 0,
      trendData: [],
      channelContributions: CHANNELS.map((ch) => ({
        channel: ch,
        conversions: 0,
        percentage: 0,
        color: CHANNEL_COLORS[ch],
      })),
      topPaths: [],
      attributionModels: [
        { model: 'First-Touch', Search: 0, YouTube: 0, Display: 0, Discover: 0, Gmail: 0, Direct: 0 },
        { model: 'Last-Touch', Search: 0, YouTube: 0, Display: 0, Discover: 0, Gmail: 0, Direct: 0 },
        { model: 'Linear', Search: 0, YouTube: 0, Display: 0, Discover: 0, Gmail: 0, Direct: 0 },
        { model: 'Position-Based', Search: 0, YouTube: 0, Display: 0, Discover: 0, Gmail: 0, Direct: 0 },
      ],
      dateRangeLabel: dateRangeInfo.dateRangeLabel,
      earliestTimestamp: dateRangeInfo.minTimestamp,
      latestTimestamp: dateRangeInfo.maxTimestamp,
      previousPeriodChanges: null,
    };
  }

  // 1. Group touchpoints by user_id
  const userMap = new Map<string, Touchpoint[]>();
  touchpoints.forEach((tp) => {
    const arr = userMap.get(tp.user_id) || [];
    arr.push(tp);
    userMap.set(tp.user_id, arr);
  });

  const journeys: UserJourney[] = [];
  userMap.forEach((tps, userId) => {
    tps.sort((a, b) => a.interaction_sequence - b.interaction_sequence);
    const converted = tps.some((t) => t.converted);
    const total_value = tps.reduce((sum, t) => sum + (t.conversion_value_usd || 0), 0);
    const path = tps.map((t) => t.channel);

    journeys.push({
      user_id: userId,
      touchpoints: tps,
      converted,
      total_value,
      path,
      journey_length: tps.length,
      first_timestamp: tps[0].timestamp,
      last_timestamp: tps[tps.length - 1].timestamp,
    });
  });

  const totalUsers = journeys.length;
  const convertedJourneys = journeys.filter((j) => j.converted);
  const totalConversions = convertedJourneys.length;
  const conversionRate = totalUsers > 0 ? (totalConversions / totalUsers) * 100 : 0;
  
  const totalConvertedTouchpoints = convertedJourneys.reduce((sum, j) => sum + j.journey_length, 0);
  const avgJourneyLength = totalConversions > 0 ? totalConvertedTouchpoints / totalConversions : 0;
  const totalRevenue = convertedJourneys.reduce((sum, j) => sum + j.total_value, 0);

  // 2. Channel Contribution (Last-Touch attribution / converted channel)
  const channelConversionsCount: Record<ChannelName, number> = {
    Search: 0,
    YouTube: 0,
    Display: 0,
    Discover: 0,
    Gmail: 0,
    Direct: 0,
  };

  convertedJourneys.forEach((j) => {
    const lastChannel = j.path[j.path.length - 1];
    if (channelConversionsCount[lastChannel] !== undefined) {
      channelConversionsCount[lastChannel] += 1;
    }
  });

  let topChannel: ChannelName = 'Search';
  let maxCount = -1;
  const channelContributions: ChannelContribution[] = CHANNELS.map((ch) => {
    const cnt = channelConversionsCount[ch];
    if (cnt > maxCount) {
      maxCount = cnt;
      topChannel = ch;
    }
    const pct = totalConversions > 0 ? (cnt / totalConversions) * 100 : 0;
    return {
      channel: ch,
      conversions: cnt,
      percentage: Number(pct.toFixed(1)),
      color: CHANNEL_COLORS[ch],
    };
  }).sort((a, b) => b.conversions - a.conversions);

  const topChannelShare = totalConversions > 0 ? (maxCount / totalConversions) * 100 : 0;

  // 3. Top 5 Conversion Paths
  const pathFrequency = new Map<string, { path: ChannelName[]; count: number }>();
  convertedJourneys.forEach((j) => {
    const key = j.path.join(' → ');
    const existing = pathFrequency.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      pathFrequency.set(key, { path: j.path, count: 1 });
    }
  });

  const sortedPaths = Array.from(pathFrequency.values()).sort((a, b) => b.count - a.count);
  const topPaths: TopPathItem[] = sortedPaths.slice(0, 5).map((p) => ({
    path: p.path,
    count: p.count,
    percentage: Number(((p.count / totalConversions) * 100).toFixed(1)),
  }));

  // 4. Attribution Models: First-Touch, Last-Touch, Linear, Position-Based (40/20/40)
  const credits: Record<'First-Touch' | 'Last-Touch' | 'Linear' | 'Position-Based', Record<ChannelName, number>> = {
    'First-Touch': { Search: 0, YouTube: 0, Display: 0, Discover: 0, Gmail: 0, Direct: 0 },
    'Last-Touch': { Search: 0, YouTube: 0, Display: 0, Discover: 0, Gmail: 0, Direct: 0 },
    'Linear': { Search: 0, YouTube: 0, Display: 0, Discover: 0, Gmail: 0, Direct: 0 },
    'Position-Based': { Search: 0, YouTube: 0, Display: 0, Discover: 0, Gmail: 0, Direct: 0 },
  };

  convertedJourneys.forEach((j) => {
    const p = j.path;
    const n = p.length;

    // First Touch: 100% to first
    credits['First-Touch'][p[0]] += 1;

    // Last Touch: 100% to last
    credits['Last-Touch'][p[n - 1]] += 1;

    // Linear: 1/n to each
    const linearCredit = 1 / n;
    p.forEach((ch) => {
      credits['Linear'][ch] += linearCredit;
    });

    // Position-Based: 40% first, 40% last, 20% middle
    if (n === 1) {
      credits['Position-Based'][p[0]] += 1;
    } else if (n === 2) {
      credits['Position-Based'][p[0]] += 0.5;
      credits['Position-Based'][p[1]] += 0.5;
    } else {
      credits['Position-Based'][p[0]] += 0.4;
      credits['Position-Based'][p[n - 1]] += 0.4;
      const middleCredit = 0.2 / (n - 2);
      for (let i = 1; i < n - 1; i++) {
        credits['Position-Based'][p[i]] += middleCredit;
      }
    }
  });

  const attributionModels: AttributionModelRow[] = (['First-Touch', 'Last-Touch', 'Linear', 'Position-Based'] as const).map((model) => {
    const row: AttributionModelRow = {
      model,
      Search: totalConversions > 0 ? Number(((credits[model].Search / totalConversions) * 100).toFixed(1)) : 0,
      YouTube: totalConversions > 0 ? Number(((credits[model].YouTube / totalConversions) * 100).toFixed(1)) : 0,
      Display: totalConversions > 0 ? Number(((credits[model].Display / totalConversions) * 100).toFixed(1)) : 0,
      Discover: totalConversions > 0 ? Number(((credits[model].Discover / totalConversions) * 100).toFixed(1)) : 0,
      Gmail: totalConversions > 0 ? Number(((credits[model].Gmail / totalConversions) * 100).toFixed(1)) : 0,
      Direct: totalConversions > 0 ? Number(((credits[model].Direct / totalConversions) * 100).toFixed(1)) : 0,
    };
    return row;
  });

  // 5. Weekly Conversion Trend (Grouped by week)
  const weeklyMap = new Map<string, { weekStart: Date; conversions: number; interactions: number }>();

  touchpoints.forEach((tp) => {
    const d = new Date(tp.timestamp);
    if (!isNaN(d.getTime())) {
      const sunday = getSundayOfWeek(d);
      const weekKey = sunday.toISOString().slice(0, 10); // YYYY-MM-DD
      const item = weeklyMap.get(weekKey) || { weekStart: sunday, conversions: 0, interactions: 0 };
      item.interactions += 1;
      if (tp.converted) {
        item.conversions += 1;
      }
      weeklyMap.set(weekKey, item);
    }
  });

  // Sort weekly keys
  const sortedWeekKeys = Array.from(weeklyMap.keys()).sort();
  const trendData: WeeklyTrendPoint[] = sortedWeekKeys.map((weekKey) => {
    const item = weeklyMap.get(weekKey)!;
    const weekStart = item.weekStart;
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

    const displayDate = weekStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

    const fullLabel = `${weekStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    })} – ${weekEnd.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    })}`;

    const rate = item.interactions > 0 ? (item.conversions / item.interactions) * 100 : 0;
    return {
      weekKey,
      date: weekKey,
      displayDate,
      fullLabel,
      conversions: item.conversions,
      totalInteractions: item.interactions,
      conversionRate: Number(rate.toFixed(1)),
    };
  });

  // 6. Calculate "vs. previous period" changes
  // Compare the selected period (e.g. 90 days) to the 90 days before, or set to null if there's no prior data
  let previousPeriodChanges: PreviousPeriodChanges | null = null;
  const pool = allTouchpoints || touchpoints;

  const currentEarliestTime = dateRangeInfo.earliestDate.getTime();
  const currentLatestTime = dateRangeInfo.latestDate.getTime();
  const periodDurationMs = Math.max(currentLatestTime - currentEarliestTime, 86400000);

  // Prior period: [currentEarliestTime - periodDurationMs, currentEarliestTime)
  const priorPeriodStart = currentEarliestTime - periodDurationMs;
  const priorPeriodEnd = currentEarliestTime;

  const priorTouchpoints = pool.filter((tp) => {
    const t = new Date(tp.timestamp).getTime();
    return t >= priorPeriodStart && t < priorPeriodEnd;
  });

  if (priorTouchpoints.length > 0) {
    const prevMetrics = computeHighLevelMetrics(priorTouchpoints);
    if (prevMetrics.totalUsers > 0) {
      const conversionsPct =
        prevMetrics.totalConversions > 0
          ? ((totalConversions - prevMetrics.totalConversions) / prevMetrics.totalConversions) * 100
          : 0;

      const conversionRateDelta = conversionRate - prevMetrics.conversionRate;

      const journeyLengthPct =
        prevMetrics.avgJourneyLength > 0
          ? ((avgJourneyLength - prevMetrics.avgJourneyLength) / prevMetrics.avgJourneyLength) * 100
          : 0;

      previousPeriodChanges = {
        conversionsPct: Number(conversionsPct.toFixed(1)),
        conversionRateDelta: Number(conversionRateDelta.toFixed(1)),
        journeyLengthPct: Number(journeyLengthPct.toFixed(1)),
      };
    }
  }

  return {
    totalConversions,
    totalUsers,
    conversionRate: Number(conversionRate.toFixed(1)),
    avgJourneyLength: Number(avgJourneyLength.toFixed(1)),
    topChannel,
    topChannelShare: Number(topChannelShare.toFixed(1)),
    totalRevenue,
    trendData,
    channelContributions,
    topPaths,
    attributionModels,
    dateRangeLabel: dateRangeInfo.dateRangeLabel,
    earliestTimestamp: dateRangeInfo.minTimestamp,
    latestTimestamp: dateRangeInfo.maxTimestamp,
    previousPeriodChanges,
  };
}

/**
 * Extract structured UserJourney objects from a list of Touchpoints
 */
export function extractUserJourneys(touchpoints: Touchpoint[]): UserJourney[] {
  if (!touchpoints || touchpoints.length === 0) return [];

  const userMap = new Map<string, Touchpoint[]>();
  touchpoints.forEach((tp) => {
    const arr = userMap.get(tp.user_id) || [];
    arr.push(tp);
    userMap.set(tp.user_id, arr);
  });

  const journeys: UserJourney[] = [];
  userMap.forEach((tps, userId) => {
    tps.sort((a, b) => a.interaction_sequence - b.interaction_sequence);
    const converted = tps.some((t) => t.converted);
    const total_value = tps.reduce((sum, t) => sum + (t.conversion_value_usd || 0), 0);
    const path = tps.map((t) => t.channel);

    journeys.push({
      user_id: userId,
      touchpoints: tps,
      converted,
      total_value,
      path,
      journey_length: tps.length,
      first_timestamp: tps[0].timestamp,
      last_timestamp: tps[tps.length - 1].timestamp,
    });
  });

  return journeys;
}

/**
 * Compute Channel Performance metrics for each channel:
 * touchpoints, conversions, revenue, first touch %, middle touch %, last touch %
 */
export function computeChannelPerformance(
  touchpoints: Touchpoint[],
  journeys?: UserJourney[]
): ChannelPerformanceMetric[] {
  const userJourneys = journeys || extractUserJourneys(touchpoints);
  const totalJourneys = userJourneys.length;

  let totalMiddleTouchesCount = 0;
  userJourneys.forEach((j) => {
    if (j.journey_length > 2) {
      totalMiddleTouchesCount += j.journey_length - 2;
    }
  });

  return CHANNELS.map((ch) => {
    // 1. Total touchpoints on this channel
    const channelTouchpoints = touchpoints.filter((t) => t.channel === ch);
    const touchpointsCount = channelTouchpoints.length;

    // 2. Converted journeys containing this channel as last touch (closing) or present
    const lastTouchConversions = userJourneys.filter(
      (j) => j.converted && j.path[j.path.length - 1] === ch
    ).length;

    // 3. Revenue from touchpoints or attributed
    const revenue = channelTouchpoints.reduce((sum, t) => sum + (t.conversion_value_usd || 0), 0);

    // 4. First touch count
    const firstTouchCount = userJourneys.filter((j) => j.path[0] === ch).length;
    const firstTouchPct = totalJourneys > 0 ? (firstTouchCount / totalJourneys) * 100 : 0;

    // 5. Middle touch count (interactions between first and last)
    let middleTouchCount = 0;
    userJourneys.forEach((j) => {
      if (j.journey_length > 2) {
        for (let i = 1; i < j.journey_length - 1; i++) {
          if (j.path[i] === ch) {
            middleTouchCount++;
          }
        }
      }
    });
    const middleTouchPct =
      totalMiddleTouchesCount > 0 ? (middleTouchCount / totalMiddleTouchesCount) * 100 : 0;

    // 6. Last touch count (overall, converted or not)
    const lastTouchCount = userJourneys.filter(
      (j) => j.path[j.path.length - 1] === ch
    ).length;
    const lastTouchPct = totalJourneys > 0 ? (lastTouchCount / totalJourneys) * 100 : 0;

    // Conversion rate for journeys where this channel appeared
    const journeysWithChannel = userJourneys.filter((j) => j.path.includes(ch)).length;
    const convJourneysWithChannel = userJourneys.filter(
      (j) => j.converted && j.path.includes(ch)
    ).length;
    const conversionRate =
      journeysWithChannel > 0 ? (convJourneysWithChannel / journeysWithChannel) * 100 : 0;

    return {
      channel: ch,
      touchpoints: touchpointsCount,
      conversions: lastTouchConversions,
      conversionRate: Number(conversionRate.toFixed(1)),
      revenue,
      firstTouchCount,
      firstTouchPct: Number(firstTouchPct.toFixed(1)),
      middleTouchCount,
      middleTouchPct: Number(middleTouchPct.toFixed(1)),
      lastTouchCount,
      lastTouchPct: Number(lastTouchPct.toFixed(1)),
      color: CHANNEL_COLORS[ch],
    };
  });
}

/**
 * Compute Audience Insights:
 * Converters vs. Non-converters by journey length and number of different channels used
 */
export function computeAudienceInsights(
  touchpoints: Touchpoint[],
  journeys?: UserJourney[]
): AudienceInsightsData {
  const userJourneys = journeys || extractUserJourneys(touchpoints);
  const converters = userJourneys.filter((j) => j.converted);
  const nonConverters = userJourneys.filter((j) => !j.converted);

  // 1. Distribution by Journey Length (1 to 8)
  const byJourneyLength: JourneyLengthAudiencePoint[] = [];
  for (let len = 1; len <= 8; len++) {
    const convCount = converters.filter((j) => j.journey_length === len).length;
    const nonConvCount = nonConverters.filter((j) => j.journey_length === len).length;
    const totalUsersWithLen = convCount + nonConvCount;
    const rate = totalUsersWithLen > 0 ? (convCount / totalUsersWithLen) * 100 : 0;

    byJourneyLength.push({
      length: len,
      label: len === 1 ? '1 Touch' : `${len} Touches`,
      converters: convCount,
      nonConverters: nonConvCount,
      conversionRate: Number(rate.toFixed(1)),
    });
  }

  // 2. Distribution by Number of Different Channels Used (1 to 6)
  const byChannelDiversity: ChannelDiversityAudiencePoint[] = [];
  for (let count = 1; count <= 6; count++) {
    const convCount = converters.filter((j) => new Set(j.path).size === count).length;
    const nonConvCount = nonConverters.filter((j) => new Set(j.path).size === count).length;
    const totalWithDiversity = convCount + nonConvCount;
    const rate = totalWithDiversity > 0 ? (convCount / totalWithDiversity) * 100 : 0;

    byChannelDiversity.push({
      channelCount: count,
      label: count === 1 ? '1 Channel' : count === 6 ? '6 Channels' : `${count} Channels`,
      converters: convCount,
      nonConverters: nonConvCount,
      conversionRate: Number(rate.toFixed(1)),
    });
  }

  // Averages
  const avgLengthConverters =
    converters.length > 0
      ? converters.reduce((s, j) => s + j.journey_length, 0) / converters.length
      : 0;
  const avgLengthNonConverters =
    nonConverters.length > 0
      ? nonConverters.reduce((s, j) => s + j.journey_length, 0) / nonConverters.length
      : 0;

  const avgChannelsConverters =
    converters.length > 0
      ? converters.reduce((s, j) => s + new Set(j.path).size, 0) / converters.length
      : 0;
  const avgChannelsNonConverters =
    nonConverters.length > 0
      ? nonConverters.reduce((s, j) => s + new Set(j.path).size, 0) / nonConverters.length
      : 0;

  // Single vs. Multi-channel conversion rates
  const singleChannelUsers = userJourneys.filter((j) => new Set(j.path).size === 1);
  const multiChannelUsers = userJourneys.filter((j) => new Set(j.path).size > 1);

  const singleChannelConverters = singleChannelUsers.filter((j) => j.converted).length;
  const multiChannelConverters = multiChannelUsers.filter((j) => j.converted).length;

  const singleChannelConvRate =
    singleChannelUsers.length > 0
      ? (singleChannelConverters / singleChannelUsers.length) * 100
      : 0;
  const multiChannelConvRate =
    multiChannelUsers.length > 0
      ? (multiChannelConverters / multiChannelUsers.length) * 100
      : 0;

  const liftMultiChannel =
    singleChannelConvRate > 0
      ? ((multiChannelConvRate - singleChannelConvRate) / singleChannelConvRate) * 100
      : 0;

  return {
    byJourneyLength,
    byChannelDiversity,
    avgLengthConverters: Number(avgLengthConverters.toFixed(1)),
    avgLengthNonConverters: Number(avgLengthNonConverters.toFixed(1)),
    avgChannelsConverters: Number(avgChannelsConverters.toFixed(1)),
    avgChannelsNonConverters: Number(avgChannelsNonConverters.toFixed(1)),
    multiChannelConvRate: Number(multiChannelConvRate.toFixed(1)),
    singleChannelConvRate: Number(singleChannelConvRate.toFixed(1)),
    liftMultiChannel: Number(liftMultiChannel.toFixed(0)),
  };
}

/**
 * Analyze customer journeys matching an interactive sequence of steps (e.g. ['YouTube', 'Search'])
 * Supports 'Any' at any step position.
 * Computes:
 * - Match count & % of total traffic
 * - Conversions count & conversion rate
 * - Lift vs overall baseline conversion rate
 * - Total revenue & AOV
 * - Average days to convert for matched users
 * - "Next Step Transitions" (Markov forward branch probabilities)
 */
export function computeSequenceAnalysis(
  journeys: UserJourney[],
  steps: (ChannelName | 'Any')[]
): SequenceAnalysisResult {
  const totalJourneysCount = journeys.length;
  const totalConverted = journeys.filter((j) => j.converted).length;
  const baselineConversionRate = totalJourneysCount > 0 ? (totalConverted / totalJourneysCount) * 100 : 0;

  // Filter journeys matching the sequence
  const activeSteps = steps.filter(Boolean);

  const matchingJourneys = journeys.filter((j) => {
    if (activeSteps.length === 0) return true;
    if (j.path.length < activeSteps.length) return false;

    for (let i = 0; i < activeSteps.length; i++) {
      const targetChannel = activeSteps[i];
      if (targetChannel !== 'Any' && j.path[i] !== targetChannel) {
        return false;
      }
    }
    return true;
  });

  const matchingJourneysCount = matchingJourneys.length;
  const shareOfTraffic = totalJourneysCount > 0 ? (matchingJourneysCount / totalJourneysCount) * 100 : 0;

  const convertedMatching = matchingJourneys.filter((j) => j.converted);
  const conversionsCount = convertedMatching.length;
  const conversionRate = matchingJourneysCount > 0 ? (conversionsCount / matchingJourneysCount) * 100 : 0;
  const liftVsBaseline =
    baselineConversionRate > 0
      ? ((conversionRate - baselineConversionRate) / baselineConversionRate) * 100
      : 0;

  const totalRevenue = convertedMatching.reduce((s, j) => s + j.total_value, 0);
  const avgOrderValue = conversionsCount > 0 ? totalRevenue / conversionsCount : 0;

  // Days to convert for converted matching
  let totalDays = 0;
  let countWithDays = 0;
  convertedMatching.forEach((j) => {
    const t0 = new Date(j.first_timestamp).getTime();
    const t1 = new Date(j.last_timestamp).getTime();
    if (!isNaN(t0) && !isNaN(t1)) {
      const days = Math.max(0, (t1 - t0) / (1000 * 60 * 60 * 24));
      totalDays += days;
      countWithDays += 1;
    }
  });
  const avgDaysToConvert = countWithDays > 0 ? totalDays / countWithDays : 0;

  // Next step transitions
  const nextStepIndex = activeSteps.length; // 0-based index of next touchpoint
  const transitionCounts = new Map<string, number>();

  matchingJourneys.forEach((j) => {
    if (j.path.length > nextStepIndex) {
      const nextCh = j.path[nextStepIndex];
      transitionCounts.set(nextCh, (transitionCounts.get(nextCh) || 0) + 1);
    } else {
      if (j.converted) {
        transitionCounts.set('Converted', (transitionCounts.get('Converted') || 0) + 1);
      } else {
        transitionCounts.set('Dropped Off', (transitionCounts.get('Dropped Off') || 0) + 1);
      }
    }
  });

  const nextStepTransitions: NextTransitionOption[] = [];
  const targetColors: Record<string, string> = {
    ...CHANNEL_COLORS,
    Converted: '#137333',
    'Dropped Off': '#d93025',
  };

  transitionCounts.forEach((cnt, target) => {
    const pct = matchingJourneysCount > 0 ? (cnt / matchingJourneysCount) * 100 : 0;
    nextStepTransitions.push({
      target: target as ChannelName | 'Converted' | 'Dropped Off',
      count: cnt,
      percentage: Number(pct.toFixed(1)),
      color: targetColors[target] || '#70757a',
    });
  });

  nextStepTransitions.sort((a, b) => b.count - a.count);

  return {
    steps: activeSteps,
    matchingJourneysCount,
    totalJourneysCount,
    shareOfTraffic: Number(shareOfTraffic.toFixed(1)),
    conversionsCount,
    conversionRate: Number(conversionRate.toFixed(1)),
    baselineConversionRate: Number(baselineConversionRate.toFixed(1)),
    liftVsBaseline: Number(liftVsBaseline.toFixed(1)),
    totalRevenue,
    avgOrderValue: Number(avgOrderValue.toFixed(0)),
    avgDaysToConvert: Number(avgDaysToConvert.toFixed(1)),
    nextStepTransitions,
    matchingJourneys,
  };
}

/**
 * Compute conversion lag & latency distribution:
 * - Time from first touchpoint to final conversion
 * - Time buckets: < 24 Hours, 1-3 Days, 4-7 Days, 8-14 Days, 15+ Days
 * - Velocity by starting channel
 */
export function computeConversionLagMetrics(journeys: UserJourney[]): ConversionLagMetrics {
  const converters = journeys.filter((j) => j.converted);
  const totalConvertedUsers = converters.length;

  if (totalConvertedUsers === 0) {
    return {
      overallAvgDays: 0,
      medianDays: 0,
      buckets: [],
      byStartingChannel: [],
      fastestChannel: 'Search',
      longestChannel: 'Display',
      totalConvertedUsers: 0,
    };
  }

  // Calculate days for each converter
  const journeyDays: { journey: UserJourney; days: number }[] = [];
  converters.forEach((j) => {
    const t0 = new Date(j.first_timestamp).getTime();
    const t1 = new Date(j.last_timestamp).getTime();
    const diffMs = Math.max(0, t1 - t0);
    const days = diffMs / (1000 * 60 * 60 * 24);
    journeyDays.push({ journey: j, days });
  });

  // Average & Median
  const totalDays = journeyDays.reduce((s, item) => s + item.days, 0);
  const overallAvgDays = totalDays / totalConvertedUsers;

  const sortedDays = [...journeyDays].map((x) => x.days).sort((a, b) => a - b);
  const mid = Math.floor(sortedDays.length / 2);
  const medianDays = sortedDays.length % 2 !== 0 ? sortedDays[mid] : (sortedDays[mid - 1] + sortedDays[mid]) / 2;

  // Buckets definitions
  const bucketDefs = [
    {
      id: 'day_0',
      label: '< 24 Hours',
      minDays: 0,
      maxDays: 1,
      description: 'Same-day impulse & urgent checkouts',
      color: '#137333', // Green
    },
    {
      id: 'days_1_3',
      label: '1 – 3 Days',
      minDays: 1,
      maxDays: 3,
      description: 'Quick comparison & high-intent research',
      color: '#1a73e8', // Blue
    },
    {
      id: 'days_4_7',
      label: '4 – 7 Days',
      minDays: 3,
      maxDays: 7,
      description: 'Within one week consideration window',
      color: '#f9ab00', // Amber
    },
    {
      id: 'days_8_14',
      label: '8 – 14 Days',
      minDays: 7,
      maxDays: 14,
      description: 'Bi-weekly cycle & paycheck timing',
      color: '#9334e8', // Purple
    },
    {
      id: 'days_15_plus',
      label: '15+ Days',
      minDays: 14,
      maxDays: 999,
      description: 'Extended multi-touch deliberation',
      color: '#ea4335', // Red
    },
  ];

  const buckets: ConversionLagBucket[] = bucketDefs.map((def) => {
    const matching = journeyDays.filter((item) => {
      if (def.id === 'day_0') {
        return item.days < 1;
      }
      if (def.id === 'days_15_plus') {
        return item.days >= 14;
      }
      return item.days >= def.minDays && item.days < def.maxDays;
    });

    const conversions = matching.length;
    const percentage = totalConvertedUsers > 0 ? (conversions / totalConvertedUsers) * 100 : 0;
    const revenue = matching.reduce((s, item) => s + item.journey.total_value, 0);
    const avgOrderValue = conversions > 0 ? revenue / conversions : 0;

    return {
      id: def.id,
      label: def.label,
      minDays: def.minDays,
      maxDays: def.maxDays,
      conversions,
      percentage: Number(percentage.toFixed(1)),
      revenue,
      avgOrderValue: Number(avgOrderValue.toFixed(0)),
      description: def.description,
      color: def.color,
    };
  });

  // Group by starting channel
  const byChannelMap = new Map<ChannelName, { days: number[]; revenue: number }>();
  CHANNELS.forEach((ch) => byChannelMap.set(ch, { days: [], revenue: 0 }));

  journeyDays.forEach(({ journey, days }) => {
    const startChannel = journey.path[0];
    if (byChannelMap.has(startChannel)) {
      const entry = byChannelMap.get(startChannel)!;
      entry.days.push(days);
      entry.revenue += journey.total_value;
    }
  });

  const byStartingChannel: ChannelLagSpeed[] = [];
  byChannelMap.forEach((entry, ch) => {
    if (entry.days.length > 0) {
      const avg = entry.days.reduce((s, d) => s + d, 0) / entry.days.length;
      const fastest = Math.min(...entry.days);
      byStartingChannel.push({
        channel: ch,
        avgDaysToConvert: Number(avg.toFixed(1)),
        firstTouchCount: entry.days.length,
        totalRevenue: entry.revenue,
        fastestConversionDays: Number(fastest.toFixed(1)),
        color: CHANNEL_COLORS[ch],
      });
    }
  });

  // Sort by fastest to slowest
  byStartingChannel.sort((a, b) => a.avgDaysToConvert - b.avgDaysToConvert);

  const fastestChannel = byStartingChannel.length > 0 ? byStartingChannel[0].channel : 'Search';
  const longestChannel =
    byStartingChannel.length > 0
      ? byStartingChannel[byStartingChannel.length - 1].channel
      : 'Display';

  return {
    overallAvgDays: Number(overallAvgDays.toFixed(1)),
    medianDays: Number(medianDays.toFixed(1)),
    buckets,
    byStartingChannel,
    fastestChannel,
    longestChannel,
    totalConvertedUsers,
  };
}

/**
 * Compute day-of-week engagement, conversions, and ad flighting metrics
 */
export function computeDayOfWeekSummary(touchpoints: Touchpoint[]): DayOfWeekSummary {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days: DayOfWeekChannelData[] = dayNames.map((name, i) => {
    const emptyCounts: Record<ChannelName, number> = {
      Search: 0,
      YouTube: 0,
      Display: 0,
      Discover: 0,
      Gmail: 0,
      Direct: 0,
    };
    const emptyConv: Record<ChannelName, number> = {
      Search: 0,
      YouTube: 0,
      Display: 0,
      Discover: 0,
      Gmail: 0,
      Direct: 0,
    };

    return {
      dayIndex: i,
      dayName: name,
      shortName: shortNames[i],
      totalInteractions: 0,
      totalConversions: 0,
      conversionRate: 0,
      totalRevenue: 0,
      channelCounts: emptyCounts,
      channelConversions: emptyConv,
      topChannel: 'Search',
      bestUse: '',
    };
  });

  touchpoints.forEach((tp) => {
    const d = new Date(tp.timestamp);
    if (!isNaN(d.getTime())) {
      const dayIdx = d.getUTCDay();
      const dayData = days[dayIdx];
      dayData.totalInteractions += 1;
      dayData.channelCounts[tp.channel] = (dayData.channelCounts[tp.channel] || 0) + 1;

      if (tp.converted) {
        dayData.totalConversions += 1;
        dayData.totalRevenue += tp.conversion_value_usd || 0;
        dayData.channelConversions[tp.channel] = (dayData.channelConversions[tp.channel] || 0) + 1;
      }
    }
  });

  // Calculate rates and top channels for each day
  days.forEach((day) => {
    day.conversionRate =
      day.totalInteractions > 0
        ? Number(((day.totalConversions / day.totalInteractions) * 100).toFixed(1))
        : 0;

    let maxChannel: ChannelName = 'Search';
    let maxCnt = -1;
    CHANNELS.forEach((ch) => {
      const cnt = day.channelCounts[ch] || 0;
      if (cnt > maxCnt) {
        maxCnt = cnt;
        maxChannel = ch;
      }
    });
    day.topChannel = maxChannel;

    // Qualitative best use
    if (day.dayIndex === 0 || day.dayIndex === 6) {
      day.bestUse = 'Weekend leisure discovery, social feeds, and mobile video streaming';
    } else if (day.dayIndex === 1) {
      day.bestUse = 'Monday morning re-engagement, email newsletters, and workweek planning';
    } else if (day.dayIndex === 2 || day.dayIndex === 3) {
      day.bestUse = 'Peak midweek intent, high-conversion search ads, and direct checkout';
    } else if (day.dayIndex === 4) {
      day.bestUse = 'Payday preparation, weekend event shopping, and retargeting cart reminders';
    } else {
      day.bestUse = 'Friday evening impulse discovery, entertainment, and weekend kickoffs';
    }
  });

  // Peak days
  const peakDayConversions = [...days].sort((a, b) => b.totalConversions - a.totalConversions)[0]?.dayName || 'Tuesday';
  const peakDayDiscovery = [...days].sort((a, b) => (b.channelCounts.YouTube + b.channelCounts.Discover) - (a.channelCounts.YouTube + a.channelCounts.Discover))[0]?.dayName || 'Saturday';
  const peakDayRevenue = [...days].sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.dayName || 'Wednesday';

  const recommendedFlightSchedule = [
    {
      stage: 'Top-of-Funnel Discovery' as const,
      bestDays: ['Friday', 'Saturday', 'Sunday'],
      recommendedChannels: ['YouTube' as ChannelName, 'Discover' as ChannelName],
      rationale: 'Leisure browsing hours and visual engagement peak over weekends. Ideal for video inspiration and outfit styling reels.',
    },
    {
      stage: 'Middle-Funnel Consideration' as const,
      bestDays: ['Monday', 'Tuesday'],
      recommendedChannels: ['Display' as ChannelName, 'Gmail' as ChannelName],
      rationale: 'Subscribers check inboxes at the start of the week. Display retargeting keeps the product top-of-mind during working hours.',
    },
    {
      stage: 'Bottom-Funnel Closing' as const,
      bestDays: ['Wednesday', 'Thursday'],
      recommendedChannels: ['Search' as ChannelName, 'Direct' as ChannelName],
      rationale: 'High conversion velocity before delivery deadlines. Users search exact keywords and finalize orders for weekend delivery.',
    },
  ];

  return {
    days,
    peakDayConversions,
    peakDayDiscovery,
    peakDayRevenue,
    recommendedFlightSchedule,
  };
}


