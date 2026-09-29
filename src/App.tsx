/**
 * Google Mira - Path to Conversion Insights Dashboard
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Download,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Filter,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { KpiCards } from './components/KpiCards';
import { ConversionTrendChart } from './components/ConversionTrendChart';
import { ChannelContributionChart } from './components/ChannelContributionChart';
import { TopConversionPaths } from './components/TopConversionPaths';
import { AttributionComparisonChart } from './components/AttributionComparisonChart';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { RecommendedActionsPanel } from './components/RecommendedActionsPanel';
import { ChannelIcon } from './components/ChannelIcon';
import { CsvUploadModal } from './components/CsvUploadModal';
import { BigQueryConnectorModal } from './components/BigQueryConnectorModal';
import { SharedWorkspaceModal } from './components/SharedWorkspaceModal';
import { FirebaseProjectModal } from './components/FirebaseProjectModal';
import { Flame } from 'lucide-react';

// Dedicated Page Components
import { CustomerJourneysPage } from './components/pages/CustomerJourneysPage';
import { AttributionAnalysisPage } from './components/pages/AttributionAnalysisPage';
import { ChannelPerformancePage } from './components/pages/ChannelPerformancePage';
import { AudienceInsightsPage } from './components/pages/AudienceInsightsPage';
import { AIRecommendationsPage } from './components/pages/AIRecommendationsPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { PlaceholderPage } from './components/pages/PlaceholderPage';

import {
  Touchpoint,
  DashboardMetrics,
  AIInsight,
  RecommendedAction,
  GeminiInsightsResponse,
  WorkspaceUser,
} from './types';
import {
  seedTouchpointsToFirestore,
  fetchTouchpointsFromFirestore,
  computeDashboardMetrics,
  downloadCsvTemplate,
  CHANNELS,
  CHANNEL_COLORS,
} from './utils/dataEngine';
import { logActivity } from './utils/activityLogger';
import {
  testConnection,
  auth,
  onAuthStateChanged,
  FirebaseProjectProfile,
  getActiveProjectProfile,
  onProjectSwitched,
} from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('Aug 1, 2024 – Oct 31, 2024');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Firebase Active Project State
  const [activeProjectProfile, setActiveProjectProfile] = useState<FirebaseProjectProfile>(
    getActiveProjectProfile()
  );
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);

  // Shared Workspace Collaborators State
  const [collaborators, setCollaborators] = useState<WorkspaceUser[]>([
    {
      id: 'user_ayo_gmail',
      name: 'Ayomide Rilwan',
      email: 'ayomide.rilwan4@gmail.com',
      role: 'Owner',
      initials: 'AR',
      avatarColor: '#1a73e8',
      institution: 'Primary Google Account',
    },
    {
      id: 'user_ayo_uic',
      name: 'Ayo (UIC)',
      email: 'arilw@uic.edu',
      role: 'Editor',
      initials: 'UIC',
      avatarColor: '#d9381e',
      institution: 'University of Illinois Chicago (UIC)',
    },
  ]);
  const [activeUserId, setActiveUserId] = useState<string>('user_ayo_gmail');
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState<boolean>(false);

  // Firestore data state
  const [touchpoints, setTouchpoints] = useState<Touchpoint[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Seeding state
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedProgress, setSeedProgress] = useState<number>(0);
  const [seedStatusMsg, setSeedStatusMsg] = useState<string>('');

  // CSV Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isBigQueryModalOpen, setIsBigQueryModalOpen] = useState<boolean>(false);

  // AI Insights state
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);
  const [insights, setInsights] = useState<AIInsight[]>([
    {
      title: 'Search + YouTube drives highest conversion lift',
      description:
        'Users exposed to Search followed by YouTube are 2.3x more likely to convert compared to single-channel exposure.',
      metric: '2.3x lift',
      category: 'Channel Synergy',
    },
    {
      title: 'High-value users engage across 3+ channels',
      description:
        '72% of converting users interact with at least 3 different channels within a 90-day period.',
      metric: '72% multi-touch',
      category: 'User Behavior',
    },
    {
      title: 'Conversions peak 7–14 days after first touch',
      description:
        'Most conversions occur within 7–14 days of the first interaction, regardless of channel.',
      metric: '7–14 days',
      category: 'Time to Convert',
    },
  ]);

  const [recommendations, setRecommendations] = useState<RecommendedAction[]>([
    {
      id: 1,
      title: 'Increase investment in Search + YouTube based on strong conversion lift.',
      description: 'Shift 15% of budget to coordinated search-to-video funnels.',
      impact: 'High',
      timeframe: 'Immediate',
    },
    {
      id: 2,
      title: "Retarget users who have engaged with 2+ channels but haven't converted.",
      description: 'Deploy personalized remarketing incentives on Gmail and Display.',
      impact: 'High',
      timeframe: 'Next 14 days',
    },
    {
      id: 3,
      title: 'Test creative variations on Display to improve mid-funnel engagement.',
      description: 'Optimize banner frequency capping and high-impact hero imagery.',
      impact: 'Medium',
      timeframe: 'Q4',
    },
    {
      id: 4,
      title: 'Leverage AI-generated audience segments to identify emerging high-conversion cohorts.',
      description: 'Sync high-value customer profile traits across automated bidding strategies.',
      impact: 'Medium',
      timeframe: 'Ongoing',
    },
  ]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Active workspace user
  const activeUser = collaborators.find((c) => c.id === activeUserId) || collaborators[0];

  const handleSwitchUser = (userId: string) => {
    setActiveUserId(userId);
  };

  const handleAddCollaborator = (user: WorkspaceUser) => {
    setCollaborators((prev) => {
      const exists = prev.some((u) => u.email.toLowerCase() === user.email.toLowerCase());
      if (exists) return prev;
      return [...prev, user];
    });
  };

  // Listen for Google Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const email = firebaseUser.email.toLowerCase();
        setCollaborators((prev) => {
          const exists = prev.some((u) => u.email.toLowerCase() === email);
          if (exists) {
            return prev.map((u) =>
              u.email.toLowerCase() === email
                ? { ...u, name: firebaseUser.displayName || u.name }
                : u
            );
          }
          const isUic = email.endsWith('uic.edu');
          const newUser: WorkspaceUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || email.split('@')[0],
            email: firebaseUser.email!,
            role: 'Editor',
            initials: (firebaseUser.displayName || email).slice(0, 2).toUpperCase(),
            avatarColor: isUic ? '#d9381e' : '#1a73e8',
            institution: isUic ? 'University of Illinois Chicago (UIC)' : undefined,
          };
          return [...prev, newUser];
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Initial load: test connection and fetch touchpoints
  const loadData = async () => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      await testConnection();
      const list = await fetchTouchpointsFromFirestore();

      if (list && list.length > 0) {
        setTouchpoints(list);
      } else {
        // If collection is empty, trigger seed automatically so user sees live dashboard immediately
        console.log('No touchpoints found in Firestore. Auto-seeding initial 300 users...');
        await handleSeedData(false);
      }
    } catch (err: any) {
      console.error('Failed to load touchpoints from Firestore:', err);
      setDataError('Unable to connect to Firestore. Click "Seed demo data" to initialize data.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for project profile switches across the app
    const unsubProject = onProjectSwitched((newProfile) => {
      setActiveProjectProfile(newProfile);
      loadData();
    });

    return () => {
      unsubProject();
    };
  }, []);

  // Handle Seeding Demo Data to Firestore
  const handleSeedData = async (showFeedback = true) => {
    setIsSeeding(true);
    setSeedProgress(10);
    setSeedStatusMsg('Initializing 300 customer journeys...');
    try {
      const count = await seedTouchpointsToFirestore((prog, msg) => {
        setSeedProgress(prog);
        setSeedStatusMsg(msg);
      });

      // Reload data from Firestore
      const refreshed = await fetchTouchpointsFromFirestore();
      setTouchpoints(refreshed);
      if (showFeedback) {
        showToast(`Successfully seeded ${count} touchpoints for 300 users to Firestore!`);
        logActivity('Seeded Multi-Channel Touchpoints', 'Upload', `Seeded ${count} customer journeys to Firestore.`);
      }
    } catch (err: any) {
      console.error('Seeding error:', err);
      setDataError(err?.message || 'Error seeding data to Firestore');
      showToast('Error writing touchpoints to Firestore. Please check logs.');
    } finally {
      setIsSeeding(false);
      setSeedProgress(0);
      setSeedStatusMsg('');
    }
  };

  // Calculate metrics based on touchpoints and date range/search filters
  const filteredTouchpoints = useMemo(() => {
    if (!touchpoints || touchpoints.length === 0) return [];
    let list = touchpoints;

    // Filter by date range if applicable
    if (selectedDateRange.includes('Last 30 Days')) {
      const cutoff = new Date('2024-10-01T00:00:00Z').getTime();
      list = list.filter((t) => new Date(t.timestamp).getTime() >= cutoff);
    } else if (selectedDateRange.includes('Last 60 Days')) {
      const cutoff = new Date('2024-09-01T00:00:00Z').getTime();
      list = list.filter((t) => new Date(t.timestamp).getTime() >= cutoff);
    }

    // Filter by search query (channel or user)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) => t.channel.toLowerCase().includes(q) || t.user_id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [touchpoints, selectedDateRange, searchQuery]);

  // Compute all metrics directly from Firestore touchpoints
  const metrics: DashboardMetrics = useMemo(() => {
    return computeDashboardMetrics(filteredTouchpoints, touchpoints);
  }, [filteredTouchpoints, touchpoints]);

  // Handle Generate Insights with Gemini
  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      // Send only aggregated summary to server-side Gemini route
      const aggregatedSummary = {
        totalUsers: metrics.totalUsers,
        totalConversions: metrics.totalConversions,
        conversionRate: `${metrics.conversionRate.toFixed(1)}%`,
        avgJourneyLength: `${metrics.avgJourneyLength.toFixed(1)} touchpoints`,
        topChannel: metrics.topChannel,
        topChannelShare: `${metrics.topChannelShare.toFixed(1)}%`,
        totalRevenue: `$${metrics.totalRevenue.toLocaleString()}`,
        channelContributions: metrics.channelContributions.map((c) => ({
          channel: c.channel,
          conversions: c.conversions,
          percentage: `${c.percentage}%`,
        })),
        topConversionPaths: metrics.topPaths.map((p) => ({
          path: p.path.join(' → '),
          count: p.count,
          percentage: `${p.percentage}%`,
        })),
        attributionModels: metrics.attributionModels,
      };

      const res = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aggregatedSummary),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: GeminiInsightsResponse = await res.json();
      if (data && data.insights && data.recommendations) {
        setInsights(data.insights);
        setRecommendations(data.recommendations);
        showToast('Gemini analyzed your 90-day touchpoints and updated insights!');
        logActivity(
          'Synthesized Gemini AI Insights',
          'AI',
          'Generated 3 algorithmic discoveries and 4 strategic recommendations.'
        );
      }
    } catch (err: any) {
      console.error('Error generating insights:', err);
      showToast('Could not fetch Gemini insights. Using updated contextual insights.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Export report to CSV
  const handleExportReport = () => {
    if (!filteredTouchpoints || filteredTouchpoints.length === 0) {
      showToast('No data available to export.');
      return;
    }

    const headers = ['User ID', 'Channel', 'Sequence', 'Converted', 'Conversion Value (USD)', 'Timestamp'];
    const rows = filteredTouchpoints.map((t) => [
      t.user_id,
      t.channel,
      t.interaction_sequence,
      t.converted ? 'YES' : 'NO',
      t.conversion_value_usd,
      t.timestamp,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Path_To_Conversion_Insights_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report CSV exported successfully!');
  };

  // Handle successful CSV upload: refresh all data & metrics across pages
  const handleUploadSuccess = async (importedCount: number, mode: 'replace' | 'append') => {
    setIsLoadingData(true);
    try {
      const freshDocs = await fetchTouchpointsFromFirestore();
      setTouchpoints(freshDocs);
      showToast(
        `Successfully ${mode === 'replace' ? 'replaced data with' : 'added'} ${importedCount.toLocaleString()} touchpoints in Firestore!`
      );
      logActivity(
        'Uploaded Touchpoint CSV',
        'Upload',
        `Imported ${importedCount.toLocaleString()} touchpoints via CSV file (${mode} mode).`
      );
    } catch (err: any) {
      setDataError(err.message || 'Error reloading touchpoint records');
    } finally {
      setIsLoadingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] text-gray-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased">
      {/* Top Bar */}
      <Topbar
        dateRangeLabel={metrics.dateRangeLabel}
        selectedDateRange={selectedDateRange}
        onSelectDateRange={setSelectedDateRange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeUser={activeUser}
        collaboratorsCount={collaborators.length}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        activeProjectName={activeProjectProfile.name}
        activeProjectId={activeProjectProfile.projectId}
        activeDatabaseId={activeProjectProfile.databaseId}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
      />

      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main Workspace Area */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Empty Collection Notice for Active Project Target */}
          {touchpoints.length === 0 && !isLoadingData && !isSeeding && (
            <div className="mb-6 p-4 rounded-2xl bg-[#e8f0fe] border border-[#1a73e8]/30 text-gray-900 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-white text-[#e37400] flex items-center justify-center shadow-2xs shrink-0 border border-[#feefe3]">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block text-xs">
                    Target Connected: {activeProjectProfile.name}
                  </span>
                  <span className="text-gray-600 text-[11px]">
                    Project: <code className="font-mono">{activeProjectProfile.projectId}</code> &middot; Database:{' '}
                    <code className="font-mono">{activeProjectProfile.databaseId || '(default)'}</code> (0 touchpoints)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  Upload CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleSeedData(true)}
                  className="px-3.5 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Seed 300 Journeys
                </button>
              </div>
            </div>
          )}

          {/* Seeding Progress Banner */}
          {isSeeding && (
            <div className="mb-6 p-4 rounded-2xl bg-white border border-[#1a73e8]/30 shadow-md">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-[#1a73e8] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#1a73e8]" />
                  {seedStatusMsg || 'Writing touchpoints to Firestore...'}
                </span>
                <span className="font-bold text-gray-700">{seedProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#1a73e8] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${seedProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Banner if any */}
          {dataError && !isSeeding && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{dataError}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSeedData(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
              >
                Seed demo data
              </button>
            </div>
          )}

          {/* Conditional View by activeTab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Header: Overview title and action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Key insights from customer journeys ({metrics.dateRangeLabel}) across all channels
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Seed Demo Data Button */}
                  <button
                    type="button"
                    onClick={() => handleSeedData(true)}
                    disabled={isSeeding}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    title="Write 300 users and realistic touchpoints to Firestore"
                  >
                    <Database className={`w-3.5 h-3.5 text-[#1a73e8] ${isSeeding ? 'animate-pulse' : ''}`} />
                    <span>{isSeeding ? 'Seeding...' : 'Seed demo data'}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#e8f0fe] text-[#1a73e8] font-bold">
                      {touchpoints.length > 0 ? `${touchpoints.length} docs` : '300 users'}
                    </span>
                  </button>

                  {/* Upload CSV Button (Requirement 1: Opens file picker & accepts drag-and-drop) */}
                  <label
                    id="upload-csv-btn"
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        setSelectedUploadFile(e.dataTransfer.files[0]);
                        setIsUploadModalOpen(true);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1a73e8] hover:bg-[#174ea6] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer select-none"
                    title="Upload customer journey touchpoints from CSV (accepts .csv only, drag-and-drop supported)"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload CSV</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setSelectedUploadFile(e.target.files[0]);
                          setIsUploadModalOpen(true);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>

                  {/* BigQuery & Google Cloud Connector Button */}
                  <button
                    type="button"
                    onClick={() => setIsBigQueryModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#f8fafd] hover:bg-[#e8f0fe] border border-blue-200 text-[#1a73e8] rounded-xl text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    title="Connect directly to Google BigQuery, Cloud Storage (GCS), or Firestore stream"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>BigQuery & Cloud</span>
                  </button>

                  {/* Download CSV Template Link (Requirement 8) */}
                  <button
                    type="button"
                    id="download-template-link"
                    onClick={downloadCsvTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1a73e8] hover:bg-[#e8f0fe] rounded-xl transition-colors cursor-pointer"
                    title="Download clean CSV template with headers and 3 example rows"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download CSV template</span>
                    <span className="sm:hidden">Template</span>
                  </button>

                  {/* Export Report Button */}
                  <button
                    type="button"
                    onClick={handleExportReport}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>Export Report</span>
                  </button>
                </div>
              </div>

              {/* 1. Four KPI Cards */}
              <KpiCards metrics={metrics} />

              {/* 2. Charts Row 1: Conversion Trend (Line) & Channel Contribution (Donut) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <ConversionTrendChart data={metrics.trendData} />
                </div>
                <div className="lg:col-span-5">
                  <ChannelContributionChart
                    contributions={metrics.channelContributions}
                    totalConversions={metrics.totalConversions}
                  />
                </div>
              </div>

              {/* 3. Charts Row 2: Top 5 Conversion Paths & Attribution Model Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <TopConversionPaths paths={metrics.topPaths} />
                </div>
                <div className="lg:col-span-6">
                  <AttributionComparisonChart data={metrics.attributionModels} />
                </div>
              </div>

              {/* 4. Row 3: AI Insights Panel & Recommended Actions Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <AIInsightsPanel
                    insights={insights}
                    onGenerateInsights={handleGenerateInsights}
                    isLoading={isGeneratingInsights}
                    recommendations={recommendations}
                    metrics={metrics}
                    onShowToast={showToast}
                  />
                </div>
                <div className="lg:col-span-5">
                  <RecommendedActionsPanel actions={recommendations} />
                </div>
              </div>
            </div>
          )}

          {/* 2. Customer Journeys Page */}
          {activeTab === 'journeys' && (
            <CustomerJourneysPage touchpoints={filteredTouchpoints} />
          )}

          {/* 3. Attribution Analysis Page */}
          {activeTab === 'attribution' && (
            <AttributionAnalysisPage
              attributionModels={metrics.attributionModels}
              totalConversions={metrics.totalConversions}
            />
          )}

          {/* 4. Channel Performance Page */}
          {activeTab === 'channels' && (
            <ChannelPerformancePage touchpoints={filteredTouchpoints} />
          )}

          {/* 5. Audience Insights Page */}
          {activeTab === 'audiences' && (
            <AudienceInsightsPage touchpoints={filteredTouchpoints} />
          )}

          {/* 6. AI Recommendations Page */}
          {activeTab === 'recommendations' && (
            <AIRecommendationsPage
              insights={insights}
              recommendations={recommendations}
              onGenerateInsights={handleGenerateInsights}
              isLoading={isGeneratingInsights}
              metrics={metrics}
              touchpoints={filteredTouchpoints}
              onShowToast={showToast}
            />
          )}

          {/* 7. Reports Page */}
          {activeTab === 'reports' && (
            <ReportsPage
              metrics={metrics}
              touchpoints={filteredTouchpoints}
              insights={insights}
              recommendations={recommendations}
              onExportCsv={handleExportReport}
              onShowToast={showToast}
            />
          )}

          {/* 8. History & Benchmarks Page */}
          {activeTab === 'history' && (
            <HistoryPage
              metrics={metrics}
              touchpoints={filteredTouchpoints}
              onShowToast={showToast}
              collaborators={collaborators}
            />
          )}

          {/* 9. Settings Page */}
          {activeTab === 'settings' && (
            <PlaceholderPage
              title="Settings"
              subtitle="Configure attribution windows, tracking snippets, and account preferences"
              iconType="settings"
              onBackToOverview={() => setActiveTab('overview')}
            />
          )}

          {/* 9. Help & Feedback Page */}
          {activeTab === 'help' && (
            <PlaceholderPage
              title="Help & Feedback"
              subtitle="Attribution documentation, methodologies, FAQs, and support channels"
              iconType="help"
              onBackToOverview={() => setActiveTab('overview')}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#34a853] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CSV Upload & Preview Modal */}
      <CsvUploadModal
        isOpen={isUploadModalOpen}
        initialFile={selectedUploadFile}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedUploadFile(null);
        }}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* BigQuery & Google Cloud Connector Modal */}
      <BigQueryConnectorModal
        isOpen={isBigQueryModalOpen}
        onClose={() => setIsBigQueryModalOpen(false)}
        onImportSuccess={handleUploadSuccess}
        firestoreDatabaseId={activeProjectProfile.databaseId}
      />

      {/* Shared Team Workspace Modal */}
      <SharedWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        collaborators={collaborators}
        activeUserId={activeUserId}
        onSwitchUser={handleSwitchUser}
        onAddCollaborator={handleAddCollaborator}
        onShowToast={showToast}
      />

      {/* Firebase & Firestore Project Switcher Modal */}
      <FirebaseProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectChanged={(prof) => {
          setActiveProjectProfile(prof);
          loadData();
        }}
        onShowToast={showToast}
        onSeedRequested={() => handleSeedData(true)}
        touchpointsCount={touchpoints.length}
      />
    </div>
  );
}
