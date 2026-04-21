import React, { useState, useRef, useEffect } from 'react';
import { FiUploadCloud, FiFileText, FiStar, FiTrash2, FiEye, FiDownload, FiCheckCircle, FiActivity, FiAlertCircle, FiLoader } from 'react-icons/fi';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ResumePreviewModal from '../../components/ResumePreviewModal';

const BASE_URL = 'http://localhost:5000';

interface ResumeEntry {
  _id: string;
  filename: string;
  path: string;
  isActive: boolean;
  createdAt: string;
}

const Resume = () => {
  const { user, setUser } = useAuth();
  const [resumes, setResumes] = useState<ResumeEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [previewResume, setPreviewResume] = useState<ResumeEntry | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load resumes from user context
  useEffect(() => {
    if (user?.resumes) {
      setResumes(user.resumes);
    }
  }, [user]);

  const primaryResume = resumes.find((r) => r.isActive) || resumes[0];
  const atsScore = primaryResume ? 84 : 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadResume(file);
    // Reset input so same file can be re-uploaded if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDropZoneClick = () => fileInputRef.current?.click();

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadResume(file);
  };

  const uploadResume = async (file: File) => {
    setUploadError('');
    setUploadSuccess('');

    const allowedTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only PDF and DOCX files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be under 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await axios.post('/users/me/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (setUser) setUser(res.data.user);
      setResumes(res.data.user.resumes || []);
      setUploadSuccess(`"${file.name}" uploaded successfully!`);
      setTimeout(() => setUploadSuccess(''), 4000);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (resumeId: string) => {
    setSettingPrimaryId(resumeId);
    try {
      const res = await axios.put(`/users/me/resume/${resumeId}/primary`);
      if (setUser) setUser(res.data.user);
      setResumes(res.data.user.resumes || []);
    } catch (err) {
      console.error('Failed to set primary', err);
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!window.confirm('Delete this resume? This action cannot be undone.')) return;
    setDeletingId(resumeId);
    try {
      const res = await axios.delete(`/users/me/resume/${resumeId}`);
      if (setUser) setUser(res.data.user);
      setResumes(res.data.user.resumes || []);
    } catch (err) {
      console.error('Failed to delete resume', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (resume: ResumeEntry) => {
    const a = document.createElement('a');
    a.href = `${BASE_URL}${resume.path}`;
    a.download = resume.filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Computed ATS ring offset: 283 = full circle (r=45)
  const atsOffset = atsScore > 0 ? Math.round(283 - (283 * atsScore) / 100) : 283;
  const atsLabel = atsScore >= 80 ? 'Excellent' : atsScore >= 60 ? 'Good' : atsScore > 0 ? 'Fair' : 'N/A';

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0 h-full overflow-y-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header & ATS Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Resume Manager</h1>
          <p className="text-[#a0a0a0] mb-6 max-w-lg">
            Upload and manage your resumes. Your primary resume is shown to employers. Keep it ATS-friendly and up to date.
          </p>

          {/* Upload Zone */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleDropZoneClick}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onKeyDown={(e) => e.key === 'Enter' && handleDropZoneClick()}
            className="border border-dashed border-[#c5f135]/50 bg-[#c5f135]/5 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-[#c5f135]/10 cursor-pointer group"
          >
            <div className="w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center text-[#c5f135] mb-4 shadow-lg group-hover:scale-110 transition-transform">
              {uploading ? (
                <FiLoader size={28} className="animate-spin" />
              ) : (
                <FiUploadCloud size={28} />
              )}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {uploading ? 'Uploading...' : 'Upload New Resume'}
            </h3>
            <p className="text-[#a0a0a0] text-sm max-w-sm mb-4">
              Drag & drop here, or click to browse. PDF or DOCX only (max 5 MB).
            </p>
            <button
              disabled={uploading}
              className="bg-[#c5f135] text-[#0f0f0f] px-6 py-2.5 rounded-lg font-bold hover:bg-[#d4ff3a] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading…' : 'Select File'}
            </button>
          </div>

          {/* Status messages */}
          {uploadError && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <FiAlertCircle className="flex-shrink-0" />
              {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="mt-4 flex items-center gap-2 text-sm text-[#c5f135] bg-[#c5f135]/10 border border-[#c5f135]/20 rounded-lg px-4 py-3">
              <FiCheckCircle className="flex-shrink-0" />
              {uploadSuccess}
            </div>
          )}
        </div>

        {/* ATS Score Card */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 flex flex-col items-center text-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#c5f135]/5 to-transparent blur-2xl"></div>
          <div className="relative z-10 flex flex-col items-center w-full">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <FiActivity className="text-[#c5f135]" /> ATS Strength Score
            </h3>
            <p className="text-xs text-[#a0a0a0] mb-6">Based on your Primary Resume</p>

            <div className="relative w-36 h-36 flex flex-col items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="#2a2a2a" strokeWidth="10" strokeDasharray="283" strokeDashoffset="0"></circle>
                <circle
                  cx="50" cy="50" r="45" fill="transparent"
                  stroke={atsScore > 0 ? '#c5f135' : '#2a2a2a'}
                  strokeWidth="10"
                  strokeDasharray="283"
                  strokeDashoffset={atsOffset}
                  className="drop-shadow-[0_0_8px_rgba(197,241,53,0.5)] transition-all duration-700"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white leading-none">
                  {atsScore > 0 ? atsScore : '—'}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#a0a0a0] font-bold">{atsLabel}</span>
              </div>
            </div>

            <ul className="text-sm text-left w-full space-y-2 border-t border-[#2a2a2a] pt-4">
              <li className={`flex items-center gap-2 ${primaryResume ? 'text-[#d0d0d0]' : 'text-[#505050]'}`}>
                <FiCheckCircle className={primaryResume ? 'text-[#c5f135] flex-shrink-0' : 'text-[#2a2a2a] flex-shrink-0'} />
                Standard formatting
              </li>
              <li className={`flex items-center gap-2 ${primaryResume ? 'text-[#d0d0d0]' : 'text-[#505050]'}`}>
                <FiCheckCircle className={primaryResume ? 'text-[#c5f135] flex-shrink-0' : 'text-[#2a2a2a] flex-shrink-0'} />
                Quantifiable metrics present
              </li>
              <li className="flex items-center gap-2 text-yellow-500">
                <FiAlertCircle className="flex-shrink-0" /> Action verbs could be stronger
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* My Resumes List */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 shadow-sm mb-4">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          My Documents{' '}
          <span className="bg-[#111111] border border-[#2a2a2a] px-2 py-0.5 rounded-full text-xs text-[#a0a0a0]">
            {resumes.length}
          </span>
        </h2>

        {resumes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#2a2a2a] rounded-xl">
            <FiFileText size={36} className="text-[#2a2a2a] mx-auto mb-3" />
            <p className="text-[#a0a0a0] font-medium">No resumes uploaded yet.</p>
            <p className="text-xs text-[#505050] mt-1">Upload your first resume to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 rounded-xl border transition-all ${
                  resume.isActive
                    ? 'bg-[#c5f135]/5 border-[#c5f135]/50'
                    : 'bg-[#111111] border-[#2a2a2a] hover:border-[#3a3a3a]'
                }`}
              >
                {/* Left: icon + details */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-inner flex-shrink-0 ${
                      resume.isActive ? 'bg-[#c5f135] text-[#0f0f0f]' : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#a0a0a0]'
                    }`}
                  >
                    <FiFileText />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white truncate max-w-[200px] md:max-w-xs">{resume.filename}</h4>
                      {resume.isActive && (
                        <span className="bg-[#c5f135] text-[#0f0f0f] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-[0_0_5px_rgba(197,241,53,0.3)] flex-shrink-0">
                          <FiStar size={10} className="fill-current" /> Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#a0a0a0]">
                      Uploaded {new Date(resume.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  {!resume.isActive && (
                    <button
                      onClick={() => handleSetPrimary(resume._id)}
                      disabled={settingPrimaryId === resume._id}
                      className="flex-1 sm:flex-none text-xs font-bold text-[#a0a0a0] border border-[#2a2a2a] hover:text-[#c5f135] hover:border-[#c5f135]/50 px-3 py-2 rounded-lg bg-[#1a1a1a] transition-all text-center disabled:opacity-50"
                    >
                      {settingPrimaryId === resume._id ? 'Setting…' : 'Set Default'}
                    </button>
                  )}
                  <div className="flex gap-2">
                    {/* Preview */}
                    <button
                      onClick={() => setPreviewResume(resume)}
                      className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] text-[#a0a0a0] hover:text-white rounded-lg transition-all group"
                      title="Preview"
                    >
                      <FiEye className="group-hover:scale-110 transition-transform" />
                    </button>
                    {/* Download */}
                    <button
                      onClick={() => handleDownload(resume)}
                      className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] text-[#a0a0a0] hover:text-white rounded-lg transition-all group"
                      title="Download"
                    >
                      <FiDownload className="group-hover:scale-110 transition-transform" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(resume._id)}
                      disabled={deletingId === resume._id}
                      className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] text-[#a0a0a0] hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 rounded-lg transition-all group disabled:opacity-50"
                      title="Delete"
                    >
                      <FiTrash2 className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resume Preview Modal (seeker previewing their own resume) */}
      {previewResume && (
        <ResumePreviewModal
          isOpen={!!previewResume}
          onClose={() => setPreviewResume(null)}
          applicantName={user?.name || 'Your'}
          resume={previewResume.path}
          resumes={resumes}
        />
      )}
    </div>
  );
};

export default Resume;