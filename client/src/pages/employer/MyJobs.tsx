import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FiCopy, FiTrash2, FiEdit2, FiLoader, FiPlus, FiCheckCircle, FiAlertCircle, FiSave } from 'react-icons/fi';
import PostJobModal from '../../components/PostJobModal';

const STATUS_COLORS: Record<string, string> = {
  Open: 'text-[#c5f135] bg-[#c5f135]/10 border-[#c5f135]/30',
  Draft: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Closed: 'text-[#606060] bg-[#2a2a2a] border-[#3a3a3a]',
};

const MyJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [cloning, setCloning] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editJob, setEditJob] = useState<any | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [isPostModalOpen, setPostModalOpen] = useState(false);

  useEffect(() => { fetchJobs(); }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`/jobs/employer/${user._id}`);
      setJobs(res.data.jobs || []);
    } catch { setJobs([]); }
    finally { setLoading(false); }
  };

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const handleClone = async (jobId: string, asDraft = false) => {
    setCloning(jobId);
    try {
      await axios.post(`/jobs/${jobId}/clone`, { asDraft });
      flash(`success:Job ${asDraft ? 'saved as draft' : 'cloned and published'}.`);
      fetchJobs();
    } catch { flash('error:Failed to clone job.'); }
    finally { setCloning(null); }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    setDeleting(jobId);
    try {
      await axios.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      flash('success:Job deleted.');
    } catch { flash('error:Failed to delete job.'); }
    finally { setDeleting(null); }
  };

  const handlePublishDraft = async (jobId: string) => {
    try {
      await axios.put(`/jobs/${jobId}`, { status: 'Open' });
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: 'Open' } : j));
      flash('success:Job published.');
    } catch { flash('error:Failed to publish.'); }
  };

  const handleEditSave = async () => {
    if (!editJob) return;
    setEditSaving(true);
    try {
      const requirementsArray = typeof editJob.requirements === 'string'
        ? editJob.requirements.split('\n').map((r: string) => r.trim()).filter(Boolean)
        : editJob.requirements;
      const res = await axios.put(`/jobs/${editJob._id}`, { ...editJob, requirements: requirementsArray });
      setJobs(prev => prev.map(j => j._id === editJob._id ? res.data : j));
      setEditJob(null);
      flash('success:Job updated.');
    } catch { flash('error:Failed to update job.'); }
    finally { setEditSaving(false); }
  };

  const filtered = filterStatus === 'All' ? jobs : jobs.filter(j => j.status === filterStatus);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold text-white">My Job Listings</h2>
          <p className="text-[#a0a0a0] text-sm mt-1">{jobs.length} total job{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setPostModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c5f135] text-[#0f0f0f] font-bold text-sm rounded-xl hover:bg-[#d4ff3a] transition-all shadow-[0_0_15px_rgba(197,241,53,0.2)]">
          <FiPlus size={14} /> Post New Job
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Open', 'Draft', 'Closed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterStatus === s ? 'bg-[#c5f135]/10 text-[#c5f135] border-[#c5f135]/30' : 'text-[#a0a0a0] border-[#2a2a2a] hover:border-[#3a3a3a]'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border ${msg.startsWith('success') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {msg.startsWith('success') ? <FiCheckCircle size={14}/> : <FiAlertCircle size={14}/>}
          {msg.split(':')[1]}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-[#a0a0a0]"><FiLoader className="animate-spin" /> Loading jobs...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <p className="text-[#a0a0a0] font-medium">No {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} jobs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(job => (
            <div key={job._id} className={`bg-[#181818] border rounded-2xl p-5 shadow-lg transition-all hover:shadow-xl group ${job.status === 'Draft' ? 'border-yellow-500/20' : 'border-[#2a2a2a] hover:border-[#c5f135]/40'}`}>
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-[#c5f135] transition-colors">{job.title}</h3>
                  <p className="text-[#c5f135] text-xs font-semibold">{job.company}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ml-2 flex-shrink-0 ${STATUS_COLORS[job.status] || STATUS_COLORS.Closed}`}>
                  {job.status}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 text-xs text-[#a0a0a0] mb-3">
                <span className="bg-[#232323] px-2 py-0.5 rounded">{job.type}</span>
                <span className="bg-[#232323] px-2 py-0.5 rounded">{job.location}</span>
                {job.salary && <span className="bg-[#232323] px-2 py-0.5 rounded">{job.salary}</span>}
              </div>

              <p className="text-sm text-[#a0a0a0] line-clamp-2 mb-3">{job.description}</p>
              <p className="text-xs text-[#505050] mb-4">Posted {new Date(job.createdAt).toLocaleDateString()}{job.clonedFrom ? ' · Cloned' : ''}</p>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap border-t border-[#2a2a2a] pt-3">
                {job.status === 'Draft' && (
                  <button onClick={() => handlePublishDraft(job._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#c5f135] text-[#0f0f0f] rounded-lg hover:bg-[#d4ff3a] transition-all">
                    Publish
                  </button>
                )}
                <button onClick={() => setEditJob({ ...job, requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#a0a0a0] border border-[#2a2a2a] rounded-lg hover:text-white hover:border-[#3a3a3a] transition-all">
                  <FiEdit2 size={11} /> Edit
                </button>
                <button onClick={() => handleClone(job._id, false)} disabled={cloning === job._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#a0a0a0] border border-[#2a2a2a] rounded-lg hover:text-[#c5f135] hover:border-[#c5f135]/30 transition-all disabled:opacity-50">
                  {cloning === job._id ? <FiLoader size={11} className="animate-spin" /> : <FiCopy size={11} />} Clone
                </button>
                <button onClick={() => handleClone(job._id, true)} disabled={cloning === job._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#a0a0a0] border border-[#2a2a2a] rounded-lg hover:text-yellow-400 hover:border-yellow-500/30 transition-all disabled:opacity-50">
                  <FiSave size={11} /> Draft
                </button>
                <button onClick={() => handleDelete(job._id)} disabled={deleting === job._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#a0a0a0] border border-[#2a2a2a] rounded-lg hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50 ml-auto">
                  {deleting === job._id ? <FiLoader size={11} className="animate-spin" /> : <FiTrash2 size={11} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && setEditJob(null)}>
          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
              <h3 className="font-bold text-white flex items-center gap-2"><FiEdit2 className="text-[#c5f135]" /> Edit Job</h3>
              <button onClick={() => setEditJob(null)} className="text-[#a0a0a0] hover:text-white text-xl">×</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              {[['title','Job Title'],['location','Location'],['salary','Salary']].map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs text-[#a0a0a0] font-semibold uppercase tracking-wide block mb-1">{label}</label>
                  <input value={editJob[key] || ''} onChange={e => setEditJob((p: any) => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c5f135] transition-colors" />
                </div>
              ))}
              <div>
                <label className="text-xs text-[#a0a0a0] font-semibold uppercase tracking-wide block mb-1">Status</label>
                <select value={editJob.status} onChange={e => setEditJob((p: any) => ({ ...p, status: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c5f135] transition-colors">
                  <option>Open</option><option>Draft</option><option>Closed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#a0a0a0] font-semibold uppercase tracking-wide block mb-1">Description</label>
                <textarea value={editJob.description || ''} onChange={e => setEditJob((p: any) => ({ ...p, description: e.target.value }))} rows={3}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c5f135] resize-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-[#a0a0a0] font-semibold uppercase tracking-wide block mb-1">Requirements (one per line)</label>
                <textarea value={editJob.requirements || ''} onChange={e => setEditJob((p: any) => ({ ...p, requirements: e.target.value }))} rows={3}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c5f135] resize-none transition-colors" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#2a2a2a] flex justify-end gap-3">
              <button onClick={() => setEditJob(null)} className="text-sm text-[#a0a0a0] hover:text-white px-4 py-2 transition-colors">Cancel</button>
              <button onClick={handleEditSave} disabled={editSaving}
                className="flex items-center gap-2 px-5 py-2 bg-[#c5f135] text-[#0f0f0f] font-bold text-sm rounded-xl hover:bg-[#d4ff3a] transition-all disabled:opacity-60">
                {editSaving ? <FiLoader size={13} className="animate-spin" /> : <FiSave size={13} />}
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PostJobModal isOpen={isPostModalOpen} onClose={() => setPostModalOpen(false)} onJobPosted={() => { setPostModalOpen(false); fetchJobs(); }} />
    </div>
  );
};

export default MyJobs;
