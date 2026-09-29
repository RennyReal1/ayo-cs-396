import React, { useState } from 'react';
import {
  Database,
  Cloud,
  Code,
  Copy,
  Check,
  Terminal,
  Upload,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Touchpoint, ChannelName } from '../types';
import { uploadTouchpointsToFirestore } from '../utils/dataEngine';

interface BigQueryConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number, mode: 'replace' | 'append') => void;
  firestoreDatabaseId?: string;
}

export const BigQueryConnectorModal: React.FC<BigQueryConnectorModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  firestoreDatabaseId = 'ai-studio-googlemira-1ffbd507-9a8f-4c61-b82b-328c38030b41',
}) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'paste' | 'script' | 'gcs'>('sql');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // JSON Ingestion State
  const [jsonInput, setJsonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<Touchpoint[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // SQL Query for BigQuery
  const bigQuerySql = `-- ====================================================================
-- Google Mira (Path to Conversion) - BigQuery Export Query
-- Run this in Google Cloud Console > BigQuery > SQL Workspace
-- ====================================================================

SELECT
  CAST(user_id AS STRING) AS user_id,
  CASE
    WHEN LOWER(channel) LIKE '%search%' OR LOWER(channel) LIKE '%google%' THEN 'Search'
    WHEN LOWER(channel) LIKE '%youtube%' OR LOWER(channel) LIKE '%video%' THEN 'YouTube'
    WHEN LOWER(channel) LIKE '%display%' OR LOWER(channel) LIKE '%gdn%' THEN 'Display'
    WHEN LOWER(channel) LIKE '%discover%' THEN 'Discover'
    WHEN LOWER(channel) LIKE '%email%' OR LOWER(channel) LIKE '%gmail%' THEN 'Gmail'
    ELSE 'Direct'
  END AS channel,
  ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY event_timestamp ASC) AS interaction_sequence,
  IF(event_name IN ('purchase', 'conversion', 'order_complete') OR converted IS TRUE, TRUE, FALSE) AS converted,
  COALESCE(CAST(revenue_usd AS FLOAT64), CAST(purchase_value AS FLOAT64), 0.0) AS conversion_value_usd,
  FORMAT_TIMESTAMP('%Y-%m-%dT%H:%M:%SZ', event_timestamp) AS timestamp
FROM
  \`your_gcp_project.your_dataset.marketing_events\`
WHERE
  event_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
ORDER BY
  user_id ASC,
  interaction_sequence ASC;`;

  // GCS Export SQL
  const gcsExportSql = `-- Export BigQuery table directly to Google Cloud Storage (GCS)
EXPORT DATA OPTIONS(
  uri='gs://your-mira-data-bucket/touchpoints_*.csv',
  format='CSV',
  overwrite=true,
  header=true,
  field_delimiter=','
) AS
SELECT
  CAST(user_id AS STRING) AS user_id,
  channel,
  ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY event_timestamp ASC) AS interaction_sequence,
  IF(converted IS TRUE, true, false) AS converted,
  COALESCE(revenue_usd, 0.0) AS conversion_value_usd,
  FORMAT_TIMESTAMP('%Y-%m-%dT%H:%M:%SZ', event_timestamp) AS timestamp
FROM \`your_gcp_project.your_dataset.marketing_events\`
WHERE event_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY);`;

  // Node.js Direct BigQuery-to-Firestore Pipeline Script
  const nodePipelineScript = `/**
 * BigQuery to Firestore Direct Streaming Pipeline
 * Run with: node sync-bigquery-to-mira.mjs
 */
import { BigQuery } from '@google-cloud/bigquery';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// 1. Initialize Clients
const bigquery = new BigQuery();
initializeApp(); // Uses default Google Cloud Application Default Credentials (ADC)
const db = getFirestore('${firestoreDatabaseId}');

async function syncBigQueryToMira() {
  console.log('Querying BigQuery customer touchpoints...');
  
  const query = \`
    SELECT user_id, channel, interaction_sequence, converted, conversion_value_usd, timestamp
    FROM \\\`your_gcp_project.your_dataset.mira_export_view\\\`
    LIMIT 50000;
  \`;

  const [rows] = await bigquery.query({ query });
  console.log(\`Fetched \${rows.length} touchpoints. Streaming to Firestore...\`);

  // Batch write in chunks of 500
  let batch = db.batch();
  let count = 0;
  let batchSize = 0;

  for (const row of rows) {
    const docRef = db.collection('p2c_touchpoints').doc();
    batch.set(docRef, {
      user_id: String(row.user_id),
      channel: row.channel,
      interaction_sequence: Number(row.interaction_sequence),
      converted: Boolean(row.converted),
      conversion_value_usd: Number(row.conversion_value_usd || 0),
      timestamp: String(row.timestamp),
    });

    batchSize++;
    count++;

    if (batchSize >= 500) {
      await batch.commit();
      console.log(\`Committed \${count} / \${rows.length} rows...\`);
      batch = db.batch();
      batchSize = 0;
    }
  }

  if (batchSize > 0) {
    await batch.commit();
  }

  console.log(\`Successfully synced \${count} touchpoints to Google Mira!\`);
}

syncBigQueryToMira().catch(console.error);`;

  // Handle parsing JSON pasted directly from BigQuery console
  const handleParseJson = () => {
    setParseError(null);
    try {
      const parsed = JSON.parse(jsonInput);
      const rows = Array.isArray(parsed) ? parsed : parsed.rows || [];
      if (rows.length === 0) {
        setParseError('Provided JSON does not contain any array rows.');
        return;
      }

      const validList: Touchpoint[] = [];
      const allowedChannels: ChannelName[] = [
        'Search',
        'YouTube',
        'Display',
        'Discover',
        'Gmail',
        'Direct',
      ];

      rows.forEach((r: any, idx: number) => {
        let ch = String(r.channel || 'Direct').trim();
        if (!allowedChannels.includes(ch as ChannelName)) {
          ch = 'Direct';
        }

        validList.push({
          user_id: String(r.user_id || `user_${idx + 1}`),
          channel: ch as ChannelName,
          interaction_sequence: Number(r.interaction_sequence) || 1,
          converted: Boolean(r.converted),
          conversion_value_usd: Number(r.conversion_value_usd) || 0,
          timestamp: r.timestamp || new Date().toISOString(),
        });
      });

      setParsedPreview(validList);
    } catch (err: any) {
      setParseError(`JSON Syntax Error: ${err.message}. Ensure valid JSON array format.`);
    }
  };

  // Upload parsed touchpoints straight to Firestore
  const handleIngestToFirestore = async () => {
    if (parsedPreview.length === 0) return;
    setIsProcessing(true);
    try {
      await uploadTouchpointsToFirestore(parsedPreview, importMode);
      onImportSuccess(parsedPreview.length, importMode);
      onClose();
    } catch (err: any) {
      setParseError(err.message || 'Failed to upload touchpoints to Firestore.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1a73e8] text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  BigQuery & Google Cloud Data Connector
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#1a73e8]">
                  Cloud Pipeline
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Stream large datasets directly from Google BigQuery, Cloud Storage (GCS), or Cloud Functions into Mira
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

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-gray-100 bg-[#f8fafd] gap-2 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sql'
                ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>1. BigQuery SQL Template</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'paste'
                ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>2. Instant JSON Ingest</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gcs')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'gcs'
                ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>3. Cloud Storage (GCS) Export</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'script'
                ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>4. Direct Node.js / Cloud Function Pipeline</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: BigQuery SQL Query */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    BigQuery SQL Extraction Query
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Copy and run this query in your Google Cloud BigQuery console to format raw clickstream/conversion data into Google Mira's touchpoint schema:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bigQuerySql, 'sql')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedKey === 'sql' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#137333]" />
                      <span className="text-[#137333]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-gray-950 text-gray-100 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-gray-800 max-h-72">
                  <code>{bigQuerySql}</code>
                </pre>
              </div>

              {/* Quick instructions */}
              <div className="bg-[#f8fafd] rounded-2xl p-4 border border-gray-200/80 space-y-2">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
                  What to do next with the BigQuery output:
                </h4>
                <ol className="text-xs text-gray-600 list-decimal pl-5 space-y-1">
                  <li>
                    Click <strong>"Save Results" &gt; "JSON (Local File)"</strong> in BigQuery and paste into the <em>Instant JSON Ingest</em> tab.
                  </li>
                  <li>
                    Or click <strong>"Save Results" &gt; "CSV"</strong> and drag-and-drop directly into Mira's CSV uploader.
                  </li>
                  <li>
                    For recurring live syncs, schedule the query or use the <em>Direct Node.js Pipeline Script</em> in Tab 4.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: Instant JSON Ingest */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Paste BigQuery JSON Results
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Paste the JSON array exported from BigQuery below to ingest it directly into your live Firestore database:
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={8}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`[\n  {\n    "user_id": "user_1001",\n    "channel": "Search",\n    "interaction_sequence": 1,\n    "converted": false,\n    "conversion_value_usd": 0,\n    "timestamp": "2024-09-01T10:00:00Z"\n  },\n  ...\n]`}
                  className="w-full p-3.5 bg-gray-950 text-gray-100 rounded-2xl font-mono text-[11px] border border-gray-800 focus:outline-none focus:border-[#1a73e8]"
                />

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleParseJson}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Validate & Preview Rows</span>
                  </button>

                  {parsedPreview.length > 0 && (
                    <span className="text-xs font-bold text-[#137333]">
                      ✓ Validated {parsedPreview.length.toLocaleString()} touchpoint records
                    </span>
                  )}
                </div>
              </div>

              {parseError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{parseError}</span>
                </div>
              )}

              {parsedPreview.length > 0 && (
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        Upload to Cloud Firestore ({parsedPreview.length.toLocaleString()} rows)
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Target collection: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">p2c_touchpoints</code>
                      </p>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex items-center bg-[#f1f3f4] p-1 rounded-xl text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setImportMode('replace')}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                          importMode === 'replace'
                            ? 'bg-white text-gray-900 shadow-2xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Replace Existing
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportMode('append')}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                          importMode === 'append'
                            ? 'bg-white text-gray-900 shadow-2xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Append to Existing
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleIngestToFirestore}
                    disabled={isProcessing}
                    className="w-full py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Streaming to Firestore (batch commit)...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>
                          Stream {parsedPreview.length.toLocaleString()} Touchpoints to Firestore
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Google Cloud Storage (GCS) */}
          {activeTab === 'gcs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Export BigQuery Directly to Google Cloud Storage (GCS)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    For datasets larger than 100MB, use BigQuery's built-in GCS export:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(gcsExportSql, 'gcs')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedKey === 'gcs' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#137333]" />
                      <span className="text-[#137333]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-gray-950 text-gray-100 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-gray-800">
                <code>{gcsExportSql}</code>
              </pre>

              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-[#1a73e8]">
                  How to link Google Cloud Storage to Google Mira:
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  After running the EXPORT statement above, BigQuery automatically creates partitioned CSV files in your bucket (e.g. <code>gs://your-bucket/touchpoints_000000000000.csv</code>). Download the files or drag them into the CSV Uploader for instant ingestion with zero data transformation needed.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Node.js / Cloud Function Pipeline */}
          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Automated Cloud Function / Node.js Streaming Script
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Run this script in Google Cloud Run, Cloud Functions, or locally to stream hundreds of thousands of rows directly into your Mira database:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(nodePipelineScript, 'script')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedKey === 'script' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#137333]" />
                      <span className="text-[#137333]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Script</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-gray-950 text-gray-100 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-gray-800 max-h-72">
                <code>{nodePipelineScript}</code>
              </pre>

              <div className="p-4 bg-[#f8fafd] rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">Your Mira Cloud Database:</span>
                  <span className="font-mono text-gray-600 text-[11px]">{firestoreDatabaseId}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#137333] font-bold text-[10px]">
                  Batch Size: 500 docs/write
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Target Collection: <strong className="text-gray-900">p2c_touchpoints</strong> in Cloud Firestore
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
