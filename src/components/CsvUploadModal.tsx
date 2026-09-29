import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Upload,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
  AlertTriangle,
  Layers,
  Trash2,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';
import { Touchpoint, ChannelName } from '../types';
import { uploadTouchpointsToFirestore, downloadCsvTemplate } from '../utils/dataEngine';
import { segmentTouchpointChannel } from '../utils/channelSegmentation';
import { ChannelIcon } from './ChannelIcon';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (importedCount: number, mode: 'replace' | 'append') => void;
  initialFile?: File | null;
}

interface SkippedRow {
  rowNumber: number;
  reason: string;
  preview: string;
}

const REQUIRED_COLUMNS = ['user_id', 'channel', 'timestamp'];
const EXPECTED_COLUMNS = [
  'user_id',
  'channel',
  'interaction_sequence',
  'converted',
  'conversion_value_usd',
  'timestamp',
];

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  initialFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  
  // Parsed and cleaned data
  const [validTouchpoints, setValidTouchpoints] = useState<Touchpoint[]>([]);
  const [skippedRows, setSkippedRows] = useState<SkippedRow[]>([]);
  const [showSkippedDetails, setShowSkippedDetails] = useState(false);
  
  // Import Options
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialFile) {
      processFile(initialFile);
    }
  }, [isOpen, initialFile]);

  if (!isOpen) return null;

  const resetState = () => {
    setSelectedFile(null);
    setIsParsing(false);
    setParseError(null);
    setMissingColumns([]);
    setValidTouchpoints([]);
    setSkippedRows([]);
    setShowSkippedDetails(false);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatusMsg('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isUploading) return; // Prevent closing mid-upload
    resetState();
    onClose();
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError('Please upload a valid .csv file.');
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);
    setMissingColumns([]);
    setValidTouchpoints([]);
    setSkippedRows([]);

    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        setIsParsing(false);

        if (results.errors && results.errors.length > 0 && (!results.data || results.data.length === 0)) {
          setParseError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }

        const rawRows = results.data;
        if (!rawRows || rawRows.length === 0) {
          setParseError('The uploaded CSV file is empty. Please provide at least one row of touchpoint data.');
          return;
        }

        // Check header columns
        const availableHeaders = results.meta.fields || (rawRows[0] ? Object.keys(rawRows[0]) : []);
        const normalizedHeaders = availableHeaders.map((h) => h.trim().toLowerCase());

        // Smart Fuzzy Column Matching for Marketers (GA4, Shopify, Meta Ads, Google Ads, HubSpot)
        const findColumn = (aliases: string[]): string | undefined => {
          return availableHeaders.find((h) => {
            const clean = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return aliases.some((a) => clean === a.toLowerCase().replace(/[^a-z0-9]/g, ''));
          });
        };

        const userIdCol = findColumn(['user_id', 'userid', 'customer_id', 'client_id', 'clientid', 'user', 'id', 'contact_id']);
        const channelCol = findColumn(['channel', 'source', 'medium', 'source_medium', 'platform', 'campaign', 'channel_group', 'traffic_source']);
        const timestampCol = findColumn(['timestamp', 'date', 'time', 'datetime', 'created_at', 'event_timestamp', 'event_time']);
        const convertedCol = findColumn(['converted', 'conversion', 'is_converted', 'purchased', 'order', 'status', 'event_name']);
        const revenueCol = findColumn(['conversion_value_usd', 'revenue', 'order_value', 'value', 'sales', 'total', 'amount', 'price', 'purchase_value']);
        const seqCol = findColumn(['interaction_sequence', 'sequence', 'step', 'order', 'touch_number', 'touchpoint_order']);

        const missing: string[] = [];
        if (!userIdCol) missing.push('user_id (or Customer ID / Client ID)');
        if (!channelCol) missing.push('channel (or Source / Medium / Platform)');
        if (!timestampCol) missing.push('timestamp (or Date / Event Time)');

        if (missing.length > 0) {
          setMissingColumns(missing);
          setParseError(`Could not automatically find required columns: ${missing.join(', ')}. Please select a column or download the standard CSV template.`);
          return;
        }

        const cleaned: Touchpoint[] = [];
        const skipped: SkippedRow[] = [];

        rawRows.forEach((row, idx) => {
          const rowNum = idx + 2;
          const rawUserId = userIdCol ? row[userIdCol] : undefined;
          const rawChannel = channelCol ? row[channelCol] : undefined;
          const rawTimestamp = timestampCol ? row[timestampCol] : undefined;

          const userId = rawUserId !== undefined && rawUserId !== null ? String(rawUserId).trim() : '';
          let channelStr = rawChannel !== undefined && rawChannel !== null ? String(rawChannel).trim() : '';
          const timestamp = rawTimestamp !== undefined && rawTimestamp !== null ? String(rawTimestamp).trim() : '';

          if (!userId || !channelStr || !timestamp) {
            skipped.push({
              rowNumber: rowNum,
              reason: 'Missing user ID, channel, or timestamp',
              preview: JSON.stringify(row).slice(0, 70),
            });
            return;
          }

          // Smart Dynamic Channel Segmentation via Rules
          const finalChannel: ChannelName = segmentTouchpointChannel(channelStr);

          // Clean `converted`
          const rawConverted = convertedCol ? String(row[convertedCol] ?? '').trim().toLowerCase() : 'false';
          const converted = ['true', '1', 'yes', 'y', 't', 'purchase', 'conversion', 'order_complete'].includes(rawConverted);

          // Sequence
          const rawSeq = seqCol ? row[seqCol] : undefined;
          let seqNum = parseInt(String(rawSeq ?? '').replace(/[^0-9]/g, ''), 10);
          if (isNaN(seqNum) || seqNum < 1) {
            seqNum = 1;
          }

          // Revenue
          const rawVal = revenueCol ? row[revenueCol] : undefined;
          let valNum = parseFloat(String(rawVal ?? '').replace(/[^0-9.-]/g, ''));
          if (isNaN(valNum) || valNum < 0) {
            valNum = converted ? 68.0 : 0; // reasonable default for converted if omitted
          }

          // Clean timestamp
          let cleanIsoTimestamp = timestamp;
          const parsedDate = new Date(timestamp);
          if (!isNaN(parsedDate.getTime())) {
            cleanIsoTimestamp = parsedDate.toISOString();
          }

          cleaned.push({
            user_id: userId,
            channel: finalChannel,
            interaction_sequence: seqNum,
            converted,
            conversion_value_usd: Math.round(valNum * 100) / 100,
            timestamp: cleanIsoTimestamp,
          });
        });

        if (cleaned.length === 0) {
          setParseError(`All ${rawRows.length} rows were skipped due to missing required fields (user_id, channel, or timestamp).`);
          setSkippedRows(skipped);
          return;
        }

        setValidTouchpoints(cleaned);
        setSkippedRows(skipped);
      },
      error: (err) => {
        setIsParsing(false);
        setParseError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (validTouchpoints.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(2);
    setUploadStatusMsg('Preparing Firestore batch pipeline...');

    try {
      await uploadTouchpointsToFirestore(
        validTouchpoints,
        importMode,
        (progress, msg) => {
          setUploadProgress(progress);
          setUploadStatusMsg(msg);
        }
      );

      // Trigger automatic refresh of all pages and metrics
      onUploadSuccess(validTouchpoints.length, importMode);
      handleClose();
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(err.message || 'Failed to complete Firestore batch upload. Please try again.');
    }
  };

  return (
    <div
      id="csv-upload-modal-overlay"
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
    >
      <div
        id="csv-upload-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-gray-200/80 max-w-2xl w-full flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 shrink-0 bg-[#f8fafd]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Upload Touchpoints CSV</h2>
              <p className="text-xs text-gray-500">
                Import customer journey data directly into Firestore (<code>p2c_touchpoints</code>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="csv-template-download-link"
              onClick={downloadCsvTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1a73e8] hover:bg-[#e8f0fe] rounded-lg transition-colors cursor-pointer"
              title="Download starter CSV template with example rows"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV Template</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-30"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* File Picker & Drag-and-Drop Area (Visible when no valid data or when re-uploading) */}
          {!validTouchpoints.length && !isUploading && (
            <div className="space-y-4">
              <div
                id="csv-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#1a73e8] bg-[#e8f0fe]/40 scale-[0.99]'
                    : 'border-gray-200 hover:border-[#1a73e8]/60 hover:bg-[#f8fafd]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-file-input"
                />

                <div className="w-12 h-12 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mx-auto mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>

                <div className="font-bold text-gray-900 text-sm mb-1">
                  Drag and drop your CSV file here
                </div>
                <p className="text-gray-500 mb-3">
                  or <span className="text-[#1a73e8] font-semibold underline">browse from your computer</span> (.csv only)
                </p>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-mono text-[11px]">
                  Columns: user_id, channel, interaction_sequence, converted, conversion_value_usd, timestamp
                </div>
              </div>

              {/* Parsing Indicator */}
              {isParsing && (
                <div className="flex items-center justify-center gap-2 py-4 text-[#1a73e8] font-semibold">
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Parsing CSV rows in browser with PapaParse...</span>
                </div>
              )}

              {/* Missing Columns Error Display (Requirement 7) */}
              {missingColumns.length > 0 && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Missing Required Columns Error</span>
                  </div>
                  <p className="text-xs text-red-800">
                    Your CSV is missing the following required column{missingColumns.length > 1 ? 's' : ''}:{' '}
                    <strong className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-red-900">
                      {missingColumns.join(', ')}
                    </strong>
                  </p>
                  <p className="text-[11px] text-red-600">
                    Expected columns are:{' '}
                    <span className="font-mono">{EXPECTED_COLUMNS.join(', ')}</span>
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={downloadCsvTemplate}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer shadow-xs text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Clean CSV Template</span>
                    </button>
                  </div>
                </div>
              )}

              {/* General Parse Error */}
              {parseError && missingColumns.length === 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold mb-0.5">Could not process CSV</div>
                    <div>{parseError}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview & Mode Selection (Requirement 4) */}
          {validTouchpoints.length > 0 && !isUploading && (
            <div className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#f8fafd] border border-gray-200/80">
                  <span className="text-gray-500 text-[11px] block">File Name</span>
                  <span className="font-bold text-gray-900 text-xs truncate block" title={selectedFile?.name}>
                    {selectedFile?.name}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#e6f4ea] border border-[#ceead6]">
                  <span className="text-[#137333] text-[11px] block">Valid Touchpoints</span>
                  <span className="font-bold text-[#137333] text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {validTouchpoints.length.toLocaleString()} rows
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  skippedRows.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-[#f8fafd] border-gray-200/80'
                }`}>
                  <span className={`${skippedRows.length > 0 ? 'text-amber-700' : 'text-gray-500'} text-[11px] block`}>
                    Skipped Rows
                  </span>
                  <span className={`font-bold text-sm ${skippedRows.length > 0 ? 'text-amber-800' : 'text-gray-900'}`}>
                    {skippedRows.length} {skippedRows.length === 1 ? 'row' : 'rows'}
                  </span>
                </div>
              </div>

              {/* Skipped Rows Accordion if any (Requirement 4) */}
              {skippedRows.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-900 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{skippedRows.length} rows were skipped due to missing fields</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSkippedDetails(!showSkippedDetails)}
                      className="text-xs font-semibold text-[#1a73e8] hover:underline cursor-pointer"
                    >
                      {showSkippedDetails ? 'Hide reasons' : 'View reasons'}
                    </button>
                  </div>

                  {showSkippedDetails && (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pt-2 border-t border-amber-200/60 font-mono text-[11px]">
                      {skippedRows.map((sk, i) => (
                        <div key={i} className="flex items-center justify-between text-amber-900 bg-white/80 px-2.5 py-1 rounded">
                          <span>Row #{sk.rowNumber}: {sk.reason}</span>
                          <span className="text-gray-400 text-[10px] truncate max-w-xs">{sk.preview}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* First 5 Rows Preview Table (Requirement 4) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px] text-gray-500">
                    Preview (First 5 Rows)
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Showing 1–{Math.min(5, validTouchpoints.length)} of {validTouchpoints.length}
                  </span>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafd] border-b border-gray-200 text-gray-600 font-semibold">
                        <th className="py-2 px-3">User ID</th>
                        <th className="py-2 px-3">Channel</th>
                        <th className="py-2 px-3">Seq</th>
                        <th className="py-2 px-3">Converted</th>
                        <th className="py-2 px-3">Value</th>
                        <th className="py-2 px-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {validTouchpoints.slice(0, 5).map((tp, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-2 px-3 font-mono font-medium text-gray-800">{tp.user_id}</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <ChannelIcon channel={tp.channel} size={16} />
                              <span className="font-semibold text-gray-900">{tp.channel}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 font-medium text-gray-600">#{tp.interaction_sequence}</td>
                          <td className="py-2 px-3">
                            {tp.converted ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f4ea] text-[#137333]">
                                Yes
                              </span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-semibold text-gray-900">
                            {tp.conversion_value_usd > 0 ? `$${tp.conversion_value_usd}` : '$0'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-gray-500">
                            {new Date(tp.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Options (Requirement 4: "Replace existing data" or "Add to existing data") */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-gray-900 text-xs block">
                  Choose Firestore Import Strategy
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Replace */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'border-[#1a73e8] bg-[#e8f0fe]/30 ring-1 ring-[#1a73e8]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-[#1a73e8] focus:ring-[#1a73e8]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Replace existing data</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Clears all current touchpoints in <code>p2c_touchpoints</code> before inserting the {validTouchpoints.length} new records.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Add */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'append'
                        ? 'border-[#1a73e8] bg-[#e8f0fe]/30 ring-1 ring-[#1a73e8]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-[#1a73e8] focus:ring-[#1a73e8]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <PlusCircle className="w-3.5 h-3.5 text-[#1a73e8]" />
                        <span>Add to existing data</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Preserves existing touchpoints and appends {validTouchpoints.length} new records to the collection.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress Bar (Requirement 5) */}
          {isUploading && (
            <div className="py-8 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6 animate-bounce" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Saving to Firestore in batches of &le;400...
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {uploadStatusMsg}
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="max-w-md mx-auto space-y-1.5">
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#1a73e8] h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 font-semibold px-1">
                  <span>Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Upload Error Display */}
          {uploadError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Firestore Save Error</div>
                <div>{uploadError}</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-[#f8fafd] flex items-center justify-between gap-4 shrink-0">
          <div>
            {validTouchpoints.length > 0 && !isUploading && (
              <button
                type="button"
                onClick={resetState}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                ← Choose another CSV
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs transition-colors disabled:opacity-40"
            >
              Cancel
            </button>

            {validTouchpoints.length > 0 && !isUploading && (
              <button
                type="button"
                id="save-csv-to-firestore-button"
                onClick={handleStartUpload}
                className="px-5 py-2 bg-[#1a73e8] hover:bg-[#174ea6] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {importMode === 'replace' ? 'Replace & Save' : 'Append & Save'}{' '}
                  {validTouchpoints.length.toLocaleString()} Touchpoints
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
