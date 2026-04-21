import React, { useState } from 'react';
import { FiX, FiDownload, FiFileText, FiAlertCircle, FiExternalLink, FiChevronDown } from 'react-icons/fi';

const BASE_URL = 'http://localhost:5000';

interface ResumeEntry {
  _id: string;
  filename: string;
  path: string;
  isActive: boolean;
  createdAt: string;
}

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantName: string;
  applicantEmail?: string;
  resume?: string;          // primary resume URL
  resumes?: ResumeEntry[];  // all resumes
}

const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  isOpen,
  onClose,
  applicantName,
  applicantEmail,
  resume,
  resumes = [],
}) => {
  // Pick active / primary first, then fallback to first in list, then resume string
  const primaryEntry = resumes.find((r) => r.isActive) || resumes[0];
  const initialUrl = primaryEntry?.path || resume || '';
  const [selectedUrl, setSelectedUrl] = useState<string>(initialUrl);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isOpen) return null;

  const fullUrl = selectedUrl ? `${BASE_URL}${selectedUrl}` : '';
  const isPdf = selectedUrl?.toLowerCase().endsWith('.pdf');
  const selectedEntry = resumes.find((r) => r.path === selectedUrl);
  const filename = selectedEntry?.filename || selectedUrl?.split('/').pop() || 'resume.pdf';
  const hasResume = !!selectedUrl;

  const handleDownload = () => {
    if (!fullUrl) return;
    const a = document.createElement('a');
    a.href = fullUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenInTab = () => {
    if (!fullUrl) return;
    window.open(fullUrl, '_blank');
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden animate-fade-in"
        style={{ maxHeight: '92vh' }}
      >
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] bg-[#181818] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c5f135]/20 to-[#c5f135]/5 border border-[#c5f135]/30 flex items-center justify-center text-[#c5f135] font-bold uppercase flex-shrink-0">
              {applicantName?.charAt(0) || '?'}
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-bold text-base leading-tight truncate">
                {applicantName}'s Resume
              </h2>
              {applicantEmail && (
                <p className="text-[#a0a0a0] text-xs truncate">{applicantEmail}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {hasResume && (
              <>
                <button
                  onClick={handleOpenInTab}
                  title="Open in new tab"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#a0a0a0] border border-[#2a2a2a] rounded-lg hover:border-[#c5f135]/50 hover:text-[#c5f135] transition-all"
                >
                  <FiExternalLink size={13} />
                  <span className="hidden sm:inline">Open</span>
                </button>
                <button
                  onClick={handleDownload}
                  title="Download resume"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#c5f135] text-[#0f0f0f] rounded-lg hover:bg-[#d4ff3a] transition-all shadow-[0_0_12px_rgba(197,241,53,0.25)]"
                >
                  <FiDownload size={13} />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#a0a0a0] hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-all"
              aria-label="Close"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* ── File Selector (only if multiple resumes) ─────────── */}
        {resumes.length > 1 && (
          <div className="flex items-center gap-3 px-6 py-3 bg-[#141414] border-b border-[#2a2a2a] flex-shrink-0">
            <FiFileText className="text-[#c5f135] flex-shrink-0" size={14} />
            <span className="text-xs text-[#a0a0a0] flex-shrink-0">Resume file:</span>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-xs text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 hover:border-[#c5f135]/40 transition-all max-w-xs"
              >
                <span className="truncate max-w-[200px]">
                  {resumes.find((r) => r.path === selectedUrl)?.filename || filename}
                </span>
                {resumes.find((r) => r.path === selectedUrl)?.isActive && (
                  <span className="bg-[#c5f135] text-[#0f0f0f] text-[9px] font-bold px-1.5 rounded uppercase flex-shrink-0">
                    Primary
                  </span>
                )}
                <FiChevronDown size={12} className={`transition-transform flex-shrink-0 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showDropdown && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl z-10 overflow-hidden">
                  {resumes.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => {
                        setSelectedUrl(r.path);
                        setIframeLoading(true);
                        setIframeError(false);
                        setShowDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#232323] transition-colors ${
                        r.path === selectedUrl ? 'bg-[#c5f135]/10' : ''
                      }`}
                    >
                      <FiFileText
                        size={14}
                        className={r.path === selectedUrl ? 'text-[#c5f135]' : 'text-[#a0a0a0]'}
                      />
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${r.path === selectedUrl ? 'text-[#c5f135]' : 'text-white'}`}>
                          {r.filename}
                        </p>
                        <p className="text-[10px] text-[#606060]">
                          {new Date(r.createdAt).toLocaleDateString()}
                          {r.isActive && ' · Primary'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Content area ─────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden bg-[#0d0d0d] relative" style={{ minHeight: '400px' }}>
          {!hasResume ? (
            /* No resume uploaded state */
            <div className="flex flex-col items-center justify-center h-full py-16 gap-4 px-6">
              <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                <FiAlertCircle size={36} className="text-[#3a3a3a]" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-bold text-lg mb-1">No Resume Uploaded</h3>
                <p className="text-[#a0a0a0] text-sm max-w-sm">
                  {applicantName} hasn't uploaded a resume yet. You can still review their profile to learn more.
                </p>
              </div>
            </div>
          ) : isPdf ? (
            /* PDF Preview via iframe */
            <div className="w-full h-full relative">
              {iframeLoading && !iframeError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d] z-10 gap-3">
                  <div className="w-10 h-10 border-2 border-[#c5f135]/30 border-t-[#c5f135] rounded-full animate-spin" />
                  <p className="text-[#a0a0a0] text-sm">Loading PDF preview…</p>
                </div>
              )}
              {iframeError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
                  <FiAlertCircle size={36} className="text-yellow-500" />
                  <div className="text-center">
                    <p className="text-white font-semibold mb-1">Preview Unavailable</p>
                    <p className="text-[#a0a0a0] text-sm mb-4">
                      The PDF couldn't be displayed inline. Use the buttons below to open or download it.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button onClick={handleOpenInTab} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#a0a0a0] border border-[#2a2a2a] rounded-lg hover:border-[#c5f135]/50 hover:text-[#c5f135] transition-all">
                        <FiExternalLink size={14} /> Open in New Tab
                      </button>
                      <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#c5f135] text-[#0f0f0f] rounded-lg hover:bg-[#d4ff3a] transition-all">
                        <FiDownload size={14} /> Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <iframe
                  key={selectedUrl}
                  src={`${fullUrl}#toolbar=1&navpanes=0`}
                  title={`${applicantName} Resume`}
                  className="w-full h-full border-0"
                  style={{ minHeight: '55vh' }}
                  onLoad={() => setIframeLoading(false)}
                  onError={() => { setIframeLoading(false); setIframeError(true); }}
                />
              )}
            </div>
          ) : (
            /* Non-PDF file — show download only */
            <div className="flex flex-col items-center justify-center h-full py-16 gap-5 px-6">
              <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                <FiFileText size={36} className="text-[#c5f135]" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-bold text-lg mb-1">{filename}</h3>
                <p className="text-[#a0a0a0] text-sm max-w-sm mb-5">
                  This file type can't be previewed directly. Download it to view the full resume.
                </p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c5f135] text-[#0f0f0f] font-bold rounded-xl hover:bg-[#d4ff3a] transition-all shadow-[0_0_20px_rgba(197,241,53,0.2)]"
                >
                  <FiDownload size={16} /> Download Resume
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#2a2a2a] bg-[#181818] flex-shrink-0">
          <p className="text-[10px] text-[#505050]">
            {resumes.length > 0
              ? `${resumes.length} resume${resumes.length > 1 ? 's' : ''} on file`
              : 'No resumes uploaded'}
          </p>
          <button
            onClick={onClose}
            className="text-xs text-[#a0a0a0] hover:text-white px-4 py-1.5 border border-[#2a2a2a] rounded-lg hover:border-[#3a3a3a] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumePreviewModal;
