import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FiFileText, FiMail, FiChevronDown, FiSend, FiCheck, FiX, FiAlertCircle, FiLoader } from 'react-icons/fi';
import ResumePreviewModal from '../../components/ResumePreviewModal';

const STATUS_OPTIONS = ['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];
const EMAIL_TYPES = [
  { value: 'interview', label: 'Interview Invitation' },
  { value: 'shortlist', label: 'Shortlisted Notification' },
  { value: 'rejection', label: 'Rejection Notice' },
  { value: 'custom', label: 'Custom Message' },
];

const STATUS_STYLES: Record<string, string> = {
  Accepted: 'bg-green-500/10 text-[#4dff91] border-green-500/20',
  Shortlisted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  'Under Review': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const Applicants: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Bulk status
  const [bulkStatus, setBulkStatus] = useState('Shortlisted');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Bulk email
  const [emailType, setEmailType] = useState('interview');
  const [customMsg, setCustomMsg] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');
  const [showEmailPanel, setShowEmailPanel] = useState(false);

  // Resume modal
  const [resumeModal, setResumeModal] = useState<{ open: boolean; name: string; email: string; resume: string; resumes: any[] }>(
    { open: false, name: '', email: '', resume: '', resumes: [] }
  );

  // F6 – Search & filter state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterJob, setFilterJob] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`/jobs/employer/${user._id}`);
      setApplications(res.data.applications || []);
    } catch { setApplications([]); }
    finally { setLoading(false); }
  };

  const toggleSelected = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === applications.length) setSelected(new Set());
    else setSelected(new Set(applications.map(a => a._id)));
  };

  const flash = (setter: (v: string) => void, msg: string) => {
    setter(msg); setTimeout(() => setter(''), 4000);
  };

  const handleBulkStatus = async () => {
    if (!selected.size) return;
    setStatusLoading(true);
    try {
      const res = await axios.put('/jobs/applications/bulk-status', { appIds: [...selected], status: bulkStatus });
      flash(setStatusMsg, `Success: ${res.data.message}`);
      setApplications(prev => prev.map(a => selected.has(a._id) ? { ...a, status: bulkStatus } : a));
      setSelected(new Set());
    } catch (e: any) {
      flash(setStatusMsg, `Error: ${e?.response?.data?.message || 'Failed'}`);
    } finally { setStatusLoading(false); }
  };

  const handleBulkEmail = async () => {
    if (!selected.size) return;
    setEmailLoading(true);
    try {
      const res = await axios.post('/jobs/applications/bulk-email', {
        appIds: [...selected],
        emailType,
        companyName: user?.companyName || 'Our Company',
        customMessage: customMsg,
      });
      flash(setEmailMsg, `Success: ${res.data.message}`);
      setShowEmailPanel(false);
      setCustomMsg('');
      setSelected(new Set());
    } catch (e: any) {
      flash(setEmailMsg, `Error: ${e?.response?.data?.message || 'Failed'}`);
    } finally { setEmailLoading(false); }
  };

  const openResume = (app: any) => setResumeModal({
    open: true, name: app.seekerId?.name || 'Applicant',
    email: app.seekerId?.email || '', resume: app.seekerId?.resume || '', resumes: app.seekerId?.resumes || [],
  });

  // F6 – derived filtered + sorted list
  const jobTitles = ['All', ...Array.from(new Set(applications.map((a: any) => a.jobId?.title).filter(Boolean)))];
  const STATUS_OPTIONS_F = ['All', 'Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];

  const filtered = applications
    .filter((app: any) => {
      const q = search.toLowerCase();
      const matchSearch = !q || app.seekerId?.name?.toLowerCase().includes(q) || app.seekerId?.email?.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'All' || app.status === filterStatus;
      const matchJob = filterJob === 'All' || app.jobId?.title === filterJob;
      return matchSearch && matchStatus && matchJob;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'date_desc') return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      if (sortBy === 'date_asc') return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
      if (sortBy === 'name_asc') return (a.seekerId?.name || '').localeCompare(b.seekerId?.name || '');
      if (sortBy === 'name_desc') return (b.seekerId?.name || '').localeCompare(a.seekerId?.name || '');
      return 0;
    });

  const allSelected = applications.length > 0 && selected.size === applications.length;
  const someSelected = selected.size > 0;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Applicants</h2>
          <p className="text-[#a0a0a0] text-sm mt-1">{applications.length} total application{applications.length !== 1 ? 's' : ''}</p>
        </div>
        {someSelected && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#c5f135] font-bold bg-[#c5f135]/10 border border-[#c5f135]/30 px-3 py-1.5 rounded-full">
              {selected.size} selected
            </span>
          </div>
        )}
      </div>

      {/* F6 – Search & Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center bg-[#181818] border border-[#2a2a2a] rounded-2xl p-4">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 min-w-[180px] bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#c5f135] transition-colors placeholder:text-[#404040]"
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="appearance-none bg-[#111] border border-[#2a2a2a] text-[#a0a0a0] text-sm px-3 py-2 rounded-xl outline-none focus:border-[#c5f135] transition-colors cursor-pointer">
          {STATUS_OPTIONS_F.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterJob} onChange={e => setFilterJob(e.target.value)}
          className="appearance-none bg-[#111] border border-[#2a2a2a] text-[#a0a0a0] text-sm px-3 py-2 rounded-xl outline-none focus:border-[#c5f135] transition-colors cursor-pointer max-w-[160px]">
          {jobTitles.map(j => <option key={j}>{j}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="appearance-none bg-[#111] border border-[#2a2a2a] text-[#a0a0a0] text-sm px-3 py-2 rounded-xl outline-none focus:border-[#c5f135] transition-colors cursor-pointer">
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
        </select>
        {(search || filterStatus !== 'All' || filterJob !== 'All') && (
          <button onClick={() => { setSearch(''); setFilterStatus('All'); setFilterJob('All'); }}
            className="text-xs text-[#a0a0a0] hover:text-red-400 border border-[#2a2a2a] px-3 py-2 rounded-xl transition-all">
            Clear
          </button>
        )}
        <span className="text-xs text-[#505050] ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Bulk Action Toolbar ─────────────────────────────── */}
      {someSelected && (
        <div className="bg-[#181818] border border-[#c5f135]/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(197,241,53,0.07)] animate-fade-in">
          <div className="flex flex-wrap gap-3 items-center">

            {/* Bulk Status */}
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <select
                  value={bulkStatus}
                  onChange={e => setBulkStatus(e.target.value)}
                  className="w-full appearance-none bg-[#111] border border-[#2a2a2a] text-white text-sm font-medium px-4 py-2.5 pr-8 rounded-xl outline-none focus:border-[#c5f135]/50 hover:border-[#3a3a3a] transition-all cursor-pointer"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] pointer-events-none" size={14} />
              </div>
              <button
                onClick={handleBulkStatus}
                disabled={statusLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#c5f135] text-[#0f0f0f] font-bold text-sm rounded-xl hover:bg-[#d4ff3a] transition-all disabled:opacity-60 shadow-[0_0_15px_rgba(197,241,53,0.2)] whitespace-nowrap"
              >
                {statusLoading ? <FiLoader size={14} className="animate-spin" /> : <FiCheck size={14} />}
                Set Status
              </button>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-[#2a2a2a] hidden sm:block" />

            {/* Email button */}
            <button
              onClick={() => setShowEmailPanel(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm rounded-xl border transition-all ${
                showEmailPanel
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-[#1a1a1a] text-[#a0a0a0] border-[#2a2a2a] hover:text-white hover:border-[#3a3a3a]'
              }`}
            >
              <FiMail size={14} />
              Send Email
              <FiChevronDown size={12} className={`transition-transform ${showEmailPanel ? 'rotate-180' : ''}`} />
            </button>

            {/* Clear selection */}
            <button
              onClick={() => setSelected(new Set())}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-[#a0a0a0] hover:text-red-400 border border-[#2a2a2a] hover:border-red-500/30 rounded-xl transition-all"
            >
              <FiX size={12} /> Clear
            </button>
          </div>

          {/* Email Compose Panel */}
          {showEmailPanel && (
            <div className="mt-4 pt-4 border-t border-[#2a2a2a] space-y-3 animate-fade-in">
              <div className="flex flex-wrap gap-3 items-start">
                <div className="relative flex-1 min-w-[220px]">
                  <label className="text-xs text-[#a0a0a0] font-medium mb-1.5 block">Email Type</label>
                  <select
                    value={emailType}
                    onChange={e => setEmailType(e.target.value)}
                    className="w-full appearance-none bg-[#111] border border-[#2a2a2a] text-white text-sm px-4 py-2.5 pr-8 rounded-xl outline-none focus:border-purple-500/50 transition-all cursor-pointer"
                  >
                    {EMAIL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-3 bottom-3 text-[#a0a0a0] pointer-events-none" size={14} />
                </div>

                {emailType === 'custom' && (
                  <div className="flex-1 min-w-[300px]">
                    <label className="text-xs text-[#a0a0a0] font-medium mb-1.5 block">Custom Message</label>
                    <textarea
                      value={customMsg}
                      onChange={e => setCustomMsg(e.target.value)}
                      placeholder="Type your message here..."
                      rows={3}
                      className="w-full bg-[#111] border border-[#2a2a2a] text-white text-sm px-4 py-2.5 rounded-xl outline-none focus:border-purple-500/50 resize-none transition-all placeholder:text-[#404040]"
                    />
                  </div>
                )}

                <div className="flex items-end">
                  <button
                    onClick={handleBulkEmail}
                    disabled={emailLoading || (emailType === 'custom' && !customMsg.trim())}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(147,51,234,0.2)] whitespace-nowrap"
                  >
                    {emailLoading ? <FiLoader size={14} className="animate-spin" /> : <FiSend size={14} />}
                    Send to {selected.size}
                  </button>
                </div>
              </div>

              {/* Email preview note */}
              <div className="flex items-start gap-2 bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3">
                <FiAlertCircle size={14} className="text-[#a0a0a0] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#a0a0a0]">
                  A branded <strong className="text-white">JobBridge</strong> email will be sent to{' '}
                  <strong className="text-[#c5f135]">{selected.size} applicant{selected.size !== 1 ? 's' : ''}</strong>.
                  Template: <span className="text-purple-400">{EMAIL_TYPES.find(t => t.value === emailType)?.label}</span>
                </p>
              </div>
            </div>
          )}

          {/* Status / Email result flash messages */}
          {statusMsg && (
            <div className={`mt-3 flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl ${statusMsg.startsWith('Success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {statusMsg}
            </div>
          )}
          {emailMsg && (
            <div className={`mt-3 flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl ${emailMsg.startsWith('Success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {emailMsg}
            </div>
          )}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-[#a0a0a0]">
          <FiLoader className="animate-spin" /> Loading applicants…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <p className="text-[#a0a0a0] font-medium">{applications.length === 0 ? 'No applications received yet.' : 'No results match your filters.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#232323] bg-[#181818] shadow-xl">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-[#111]/80 text-[#a0a0a0] text-xs border-b border-[#2a2a2a] uppercase tracking-wider">
                <th className="p-4 w-12">
                  <button
                    onClick={toggleAll}
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                      allSelected ? 'bg-[#c5f135] border-[#c5f135] text-[#0f0f0f]' : 'border-[#3a3a3a] text-[#505050] hover:border-[#c5f135]/50'
                    }`}
                  >
                    {allSelected ? <FiCheck size={11} /> : someSelected ? <span className="w-2 h-2 rounded-sm bg-[#c5f135]" /> : null}
                  </button>
                </th>
                <th className="p-4 font-semibold">Applicant</th>
                <th className="p-4 font-semibold">Job</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Applied On</th>
                <th className="p-4 font-semibold text-center">Resume</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app: any) => {
                const isChecked = selected.has(app._id);
                return (
                  <tr
                    key={app._id}
                    className={`border-b border-[#2a2a2a] transition-colors group ${isChecked ? 'bg-[#c5f135]/5' : 'hover:bg-[#1e1e1e]'}`}
                  >
                    {/* Checkbox */}
                    <td className="p-4">
                      <button
                        onClick={() => toggleSelected(app._id)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                          isChecked ? 'bg-[#c5f135] border-[#c5f135] text-[#0f0f0f]' : 'border-[#3a3a3a] hover:border-[#c5f135]/50'
                        }`}
                      >
                        {isChecked && <FiCheck size={11} />}
                      </button>
                    </td>

                    {/* Applicant */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {app.seekerId?.profilePhoto ? (
                          <img src={app.seekerId.profilePhoto} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-[#2a2a2a]" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#232323] to-[#0f0f0f] border border-[#2a2a2a] flex items-center justify-center font-bold text-sm text-white uppercase">
                            {app.seekerId?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-white text-sm block group-hover:text-[#c5f135] transition-colors">{app.seekerId?.name || 'Deleted User'}</span>
                          <span className="text-xs text-[#606060]">{app.seekerId?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Job */}
                    <td className="p-4 text-[#e0e0e0] text-sm font-medium">{app.jobId?.title || 'Deleted Job'}</td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 ${STATUS_STYLES[app.status] || STATUS_STYLES.Pending}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {app.status}
                      </span>
                    </td>

                    {/* Applied On */}
                    <td className="p-4 text-[#606060] text-sm">{new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>

                    {/* Resume */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openResume(app)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          app.seekerId?.resume
                            ? 'bg-[#c5f135]/10 text-[#c5f135] border-[#c5f135]/30 hover:bg-[#c5f135]/20 hover:shadow-[0_0_10px_rgba(197,241,53,0.2)]'
                            : 'bg-transparent text-[#404040] border-[#2a2a2a] cursor-default'
                        }`}
                      >
                        <FiFileText size={11} />
                        {app.seekerId?.resume ? 'View' : 'None'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Resume Preview Modal */}
      <ResumePreviewModal
        isOpen={resumeModal.open}
        onClose={() => setResumeModal(p => ({ ...p, open: false }))}
        applicantName={resumeModal.name}
        applicantEmail={resumeModal.email}
        resume={resumeModal.resume}
        resumes={resumeModal.resumes}
      />
    </div>
  );
};

export default Applicants;
