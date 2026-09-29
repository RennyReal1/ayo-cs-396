import React, { useState } from 'react';
import {
  Database,
  Cloud,
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Touchpoint } from '../types';

interface BigQueryConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number, mode: 'replace' | 'append') => void;
  firestoreDatabaseId?: string;
  onOpenCsvModal?: () => void;
}

export const BigQueryConnectorModal: React.FC<BigQueryConnectorModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  firestoreDatabaseId = 'ai-studio-googlemira-1ffbd507-9a8f-4c61-b82b-328c38030b41',
  onOpenCsvModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleSql = `SELECT
  user_id,
  channel,
  interaction_sequence,
  converted,
  conversion_value_usd,
  timestamp
FROM \`your_company.marketing.touchpoints\`
LIMIT 50000;`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Simple Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100/80 flex items-center justify-center text-[#1a73e8]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Data Connection & BigQuery
              </h3>
              <p className="text-xs text-gray-500">
                Choose the easiest way to bring your marketing data into Mira
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Plain English Explainer Box */}
          <div className="p-4 rounded-2xl bg-[#f8fafd] border border-blue-100/80 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#1a73e8] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600 leading-relaxed">
              <strong className="text-gray-900 font-semibold">What is BigQuery?</strong> It is simply Google Cloud's database where enterprise companies store their customer click history. If you are not a developer, <strong>you do not need to worry about BigQuery</strong>—you can simply upload a normal spreadsheet.
            </div>
          </div>

          {/* 2 Simple Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Easy Spreadsheet Upload (For Marketers) */}
            <div className="p-5 rounded-2xl border-2 border-[#1a73e8] bg-blue-50/30 flex flex-col justify-between space-y-3 relative">
              <span className="absolute -top-2.5 right-4 bg-[#1a73e8] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Recommended
              </span>
              <div>
                <div className="w-8 h-8 rounded-xl bg-white shadow-2xs border border-blue-100 flex items-center justify-center text-[#1a73e8] mb-2">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  Upload a Spreadsheet
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Export from Shopify, GA4, or Meta and drag-and-drop the CSV. Mira auto-detects your columns.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCsvModal?.();
                }}
                className="w-full py-2.5 px-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <span>Upload CSV File</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Automatic Cloud Sync (For Data Engineers) */}
            <div className="p-5 rounded-2xl border border-gray-200 hover:border-gray-300 bg-white flex flex-col justify-between space-y-3">
              <div>
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 mb-2">
                  <Cloud className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  Send to Data Team
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Share the 1-line query with your engineering or BI team to sync data straight from Google Cloud.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(sampleSql)}
                className="w-full py-2.5 px-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied Query!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>Copy Query for Engineer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional Collapsible Technical Details (Hidden by default so non-tech users aren't overwhelmed) */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center justify-between w-full text-left text-xs font-semibold text-gray-500 hover:text-gray-800 py-1 cursor-pointer"
            >
              <span>Technical Details & SQL Query (For Engineers)</span>
              {showTechnicalDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 p-3 bg-gray-900 rounded-xl text-gray-300 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-gray-400 pb-2 border-b border-gray-800">
                  <span>BigQuery SQL Query</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(sampleSql)}
                    className="text-xs text-[#8ab4f8] hover:underline cursor-pointer"
                  >
                    Copy SQL
                  </button>
                </div>
                <pre className="overflow-x-auto py-1 text-gray-300 leading-relaxed">
                  {sampleSql}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#137333]" />
            Firestore instance ready
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
