import React, { useState, useRef } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FiUploadCloud, FiBriefcase, FiSave, FiLoader, FiCheckCircle, FiAlertCircle, FiImage } from 'react-icons/fi';

const BASE_URL = 'http://localhost:5000';

const EmployerProfile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    companyName: (user as any)?.companyName || '',
    companyDescription: (user as any)?.companyDescription || '',
    name: user?.name || '',
    phone: (user as any)?.phone || '',
    address: (user as any)?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoMsg, setLogoMsg] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const companyLogo = (user as any)?.companyLogo;

  const flash = (setter: (v: string) => void, msg: string) => {
    setter(msg); setTimeout(() => setter(''), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/users/me', form);
      setUser(res.data);
      flash(setMsg, 'success:Profile updated successfully.');
    } catch {
      flash(setMsg, 'error:Failed to save profile.');
    } finally { setSaving(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { flash(setLogoMsg, 'error:Only image files are allowed.'); return; }
    if (file.size > 2 * 1024 * 1024) { flash(setLogoMsg, 'error:Logo must be under 2 MB.'); return; }

    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await axios.post('/users/me/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(res.data.user);
      flash(setLogoMsg, 'success:Company logo updated.');
    } catch {
      flash(setLogoMsg, 'error:Failed to upload logo.');
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Company Profile</h2>
        <p className="text-[#a0a0a0] text-sm mt-1">Manage your employer brand shown on all job posts and emails.</p>
      </div>

      {/* Logo Section */}
      <div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FiImage className="text-[#c5f135]" /> Company Logo</h3>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl border border-[#2a2a2a] bg-[#111] flex items-center justify-center overflow-hidden flex-shrink-0">
            {companyLogo
              ? <img src={`${BASE_URL}${companyLogo}`} alt="Logo" className="w-full h-full object-contain" />
              : <FiBriefcase size={28} className="text-[#3a3a3a]" />}
          </div>
          <div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="flex items-center gap-2 px-4 py-2 bg-[#c5f135] text-[#0f0f0f] font-bold text-sm rounded-xl hover:bg-[#d4ff3a] transition-all disabled:opacity-60"
            >
              {logoUploading ? <FiLoader size={14} className="animate-spin" /> : <FiUploadCloud size={14} />}
              {logoUploading ? 'Uploading...' : 'Upload Logo'}
            </button>
            <p className="text-xs text-[#606060] mt-2">PNG, JPG, SVG — max 2 MB</p>
            {logoMsg && (
              <p className={`text-xs mt-2 ${logoMsg.startsWith('success') ? 'text-[#c5f135]' : 'text-red-400'}`}>
                {logoMsg.split(':')[1]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-6 space-y-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><FiBriefcase className="text-[#c5f135]" /> Company Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#a0a0a0] mb-2 uppercase tracking-wide">Your Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5f135] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a0a0a0] mb-2 uppercase tracking-wide">Company Name</label>
            <input value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
              placeholder="e.g. Acme Corp"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5f135] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a0a0a0] mb-2 uppercase tracking-wide">Phone</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5f135] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a0a0a0] mb-2 uppercase tracking-wide">Location</label>
            <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="City, Country"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5f135] transition-colors" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#a0a0a0] mb-2 uppercase tracking-wide">Company Bio</label>
          <textarea value={form.companyDescription} onChange={e => setForm(p => ({ ...p, companyDescription: e.target.value }))}
            rows={4} placeholder="Describe your company, culture, and mission..."
            className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5f135] transition-colors resize-none" />
        </div>

        {msg && (
          <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${msg.startsWith('success') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {msg.startsWith('success') ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
            {msg.split(':')[1]}
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#c5f135] text-[#0f0f0f] font-bold rounded-xl hover:bg-[#d4ff3a] transition-all disabled:opacity-60 shadow-[0_0_15px_rgba(197,241,53,0.2)]">
            {saving ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Brand Preview */}
      {(form.companyName || companyLogo) && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wide mb-4">Brand Preview — How it appears on job posts</h3>
          <div className="flex items-center gap-4 p-4 bg-[#111] border border-[#2a2a2a] rounded-xl">
            <div className="w-12 h-12 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-center overflow-hidden flex-shrink-0">
              {companyLogo
                ? <img src={`${BASE_URL}${companyLogo}`} alt="Logo" className="w-full h-full object-contain" />
                : <FiBriefcase size={20} className="text-[#c5f135]" />}
            </div>
            <div>
              <p className="text-white font-bold">{form.companyName || user?.name}</p>
              <p className="text-xs text-[#606060]">{form.address || 'Location not set'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerProfile;
