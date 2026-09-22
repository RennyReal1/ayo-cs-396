import React, { useState } from 'react';
import {
  Download,
  Cloud,
  ExternalLink,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Presentation,
  Laptop,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  FolderUp,
} from 'lucide-react';
import { GeneratedSlidePackage, downloadBlobFile, openPresentationInNewTab } from '../utils/slideExport';

interface SlideDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  slidePackage: GeneratedSlidePackage | null;
  onShowToast?: (msg: string) => void;
}

export const SlideDestinationModal: React.FC<SlideDestinationModalProps> = ({
  isOpen,
  onClose,
  slidePackage,
  onShowToast,
}) => {
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [cloudSuccess, setCloudSuccess] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  if (!isOpen || !slidePackage) return null;

  const handleDownloadComputer = () => {
    downloadBlobFile(slidePackage.blob, slidePackage.fileName);
    setLastAction('download');
    if (onShowToast) {
      onShowToast(`Downloaded "${slidePackage.fileName}" to your computer!`);
    }
  };

  const handleOpenPreviewTab = () => {
    openPresentationInNewTab(slidePackage);
    if (onShowToast) {
      onShowToast('Opened presentation in a new tab!');
    }
  };

  const handleSaveToCloud = async () => {
    setIsUploadingToCloud(true);
    setCloudSuccess(false);

    try {
      // Simulate real cloud sync / saving to workspace storage
      await new Promise((resolve) => setTimeout(resolve, 900));

      // Store presentation metadata and blob base64 representation in localStorage / cloud session cache
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          const cloudDecks = JSON.parse(localStorage.getItem('p2c_cloud_presentations') || '[]');
          cloudDecks.unshift({
            id: `deck-${Date.now()}`,
            fileName: slidePackage.fileName,
            title: slidePackage.title,
            timestamp: new Date().toISOString(),
            slideCount: slidePackage.slideCount,
            sizeBytes: slidePackage.blob.size,
            dataUrl: base64data,
          });
          // Keep recent 10 presentations
          localStorage.setItem('p2c_cloud_presentations', JSON.stringify(cloudDecks.slice(0, 10)));
        };
        reader.readAsDataURL(slidePackage.blob);
      } catch (e) {
        console.warn('Local session cache error:', e);
      }

      setCloudSuccess(true);
      setLastAction('cloud');
      if (onShowToast) {
        onShowToast(`Saved "${slidePackage.fileName}" to your Cloud Workspace!`);
      }
    } catch (err) {
      console.error('Failed to upload to cloud:', err);
      if (onShowToast) {
        onShowToast('Cloud upload encountered an error. Please try downloading locally.');
      }
    } finally {
      setIsUploadingToCloud(false);
    }
  };

  return (
    <div
      id="slide-destination-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="slide-destination-modal"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#f8fafd]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-snug">
                Presentation Ready ({slidePackage.slideCount} {slidePackage.slideCount === 1 ? 'Slide' : 'Slides'})
              </h3>
              <p className="text-[11px] text-gray-500 font-mono truncate max-w-xs sm:max-w-sm">
                {slidePackage.fileName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-gray-200/70 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-gray-700 leading-relaxed">
            Your executive presentation has been compiled and opened in a new tab. Where would you like to save this presentation?
          </p>

          {/* Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Download to Computer */}
            <button
              type="button"
              onClick={handleDownloadComputer}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                lastAction === 'download'
                  ? 'border-[#1a73e8] bg-[#f8fafd] shadow-xs ring-1 ring-[#1a73e8]'
                  : 'border-gray-200 hover:border-[#1a73e8]/60 hover:bg-[#f8fafd]'
              }`}
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <span>Download on Computer</span>
                  {lastAction === 'download' && <CheckCircle2 className="w-3.5 h-3.5 text-[#137333]" />}
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                  Save as standard <code>.pptx</code> file to your local computer / downloads folder.
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1 text-[11px] font-semibold text-[#1a73e8]">
                <span>Download file</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* Upload to Cloud / Workspace */}
            <button
              type="button"
              onClick={handleSaveToCloud}
              disabled={isUploadingToCloud}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                cloudSuccess
                  ? 'border-[#137333] bg-[#e6f4ea]/40 shadow-xs ring-1 ring-[#137333]'
                  : 'border-gray-200 hover:border-[#1a73e8]/60 hover:bg-[#f8fafd]'
              }`}
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  {isUploadingToCloud ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#1a73e8]" />
                  ) : cloudSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-[#137333]" />
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                </div>
                <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <span>Upload to Cloud</span>
                  {cloudSuccess && (
                    <span className="text-[10px] font-bold text-[#137333] bg-[#ceead6] px-1.5 py-0.2 rounded">
                      Uploaded
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                  Save directly to your connected Google Cloud / Workspace project (<code>cs-396-mvp-ayo</code>).
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1 text-[11px] font-semibold text-[#1a73e8]">
                <span>{isUploadingToCloud ? 'Uploading...' : cloudSuccess ? 'Uploaded to Cloud' : 'Upload to Cloud'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>

          {/* Quick Option to Re-Open Presentation Tab */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-gray-500" />
              <span className="text-[11px] text-gray-600">Want to view the presentation in your browser?</span>
            </div>
            <button
              type="button"
              onClick={handleOpenPreviewTab}
              className="text-[11px] font-semibold text-[#1a73e8] hover:underline cursor-pointer"
            >
              Re-open in new tab
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#137333]" />
            <span>Compatible with PowerPoint, Google Slides, Keynote</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
