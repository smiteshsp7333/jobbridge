import React, { useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiSend, FiLoader, FiCheckCircle, FiAlertCircle, FiEdit2 } from 'react-icons/fi';

const TEMPLATES = [
  {
    id: 'interview',
    label: 'Interview Invitation',
    subject: 'Interview Invitation – [Job Title] at [Company]',
    body: `Dear [Applicant Name],

We are pleased to inform you that you have been shortlisted for the position of [Job Title] at [Company].

We would like to invite you for an interview. Our team will reach out shortly with the schedule and further details.

Please feel free to reply to this email if you have any questions.

Best regards,
[Company] Hiring Team`,
  },
  {
    id: 'shortlist',
    label: 'Shortlisted Notification',
    subject: "You've Been Shortlisted – [Job Title] at [Company]",
    body: `Dear [Applicant Name],

Congratulations! Your application for [Job Title] at [Company] has been shortlisted.

We were impressed with your profile and will be in touch with the next steps very soon.

Thank you for your interest.

Best regards,
[Company] Hiring Team`,
  },
  {
    id: 'rejection',
    label: 'Rejection Notice',
    subject: 'Application Update – [Job Title] at [Company]',
    body: `Dear [Applicant Name],

Thank you for your interest in the [Job Title] role at [Company] and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates at this time. 

We appreciate your effort and encourage you to apply for future openings that match your profile.

Best regards,
[Company] Hiring Team`,
  },
  {
    id: 'offer',
    label: 'Job Offer',
    subject: 'Job Offer – [Job Title] at [Company]',
    body: `Dear [Applicant Name],

We are delighted to extend an offer for the position of [Job Title] at [Company].

Please review the attached offer letter and respond at your earliest convenience. We look forward to having you on board.

Best regards,
[Company] Hiring Team`,
  },
];

const EmailTemplates: React.FC = () => {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState('interview');
  const [editedTemplates, setEditedTemplates] = useState<Record<string, { subject: string; body: string }>>(
    Object.fromEntries(TEMPLATES.map(t => [t.id, { subject: t.subject, body: t.body }]))
  );
  const [recipientEmail, setRecipientEmail] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const selected = TEMPLATES.find(t => t.id === selectedId)!;
  const companyName = (user as any)?.companyName || user?.name || 'Our Company';

  const fillTemplate = (text: string) =>
    text
      .replace(/\[Applicant Name\]/g, applicantName || '[Applicant Name]')
      .replace(/\[Job Title\]/g, jobTitle || '[Job Title]')
      .replace(/\[Company\]/g, companyName);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 5000); };

  const handleSend = async () => {
    if (!recipientEmail || !jobTitle) { flash('error:Recipient email and job title are required.'); return; }
    setSending(true);
    try {
      await axios.post('/jobs/applications/bulk-email', {
        appIds: [],
        emailType: 'custom',
        companyName,
        customMessage: fillTemplate(editedTemplates[selectedId].body),
        overrideEmails: [recipientEmail],
        overrideSubject: fillTemplate(editedTemplates[selectedId].subject),
        directSend: true,
      });
      flash('success:Email sent successfully.');
      setRecipientEmail('');
      setApplicantName('');
      setJobTitle('');
    } catch {
      flash('error:Failed to send email. Check server config.');
    } finally { setSending(false); }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Email Templates</h2>
        <p className="text-[#a0a0a0] text-sm mt-1">Edit and send branded email templates to applicants instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selector */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wide mb-3">Templates</p>
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium border transition-all ${
                selectedId === t.id
                  ? 'bg-[#c5f135]/10 text-[#c5f135] border-[#c5f135]/30'
                  : 'text-[#a0a0a0] border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-white bg-[#181818]'
              }`}
            >
              <FiMail size={14} className="flex-shrink-0" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 bg-[#181818] border border-[#2a2a2a] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2"><FiEdit2 size={14} className="text-[#c5f135]" /> {selected.label}</h3>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wide block mb-2">Subject Line</label>
            <input
              value={editedTemplates[selectedId].subject}
              onChange={e => setEditedTemplates(p => ({ ...p, [selectedId]: { ...p[selectedId], subject: e.target.value } }))}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c5f135] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wide block mb-2">Body</label>
            <textarea
              value={editedTemplates[selectedId].body}
              onChange={e => setEditedTemplates(p => ({ ...p, [selectedId]: { ...p[selectedId], body: e.target.value } }))}
              rows={10}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5f135] transition-colors resize-none font-mono leading-relaxed"
            />
            <p className="text-xs text-[#505050] mt-1">Use [Applicant Name], [Job Title], [Company] as placeholders — they are auto-filled on send.</p>
          </div>

          {/* Send Form */}
          <div className="border-t border-[#2a2a2a] pt-4 space-y-3">
            <p className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wide">Send This Template</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                placeholder="Recipient email"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c5f135] transition-colors" />
              <input value={applicantName} onChange={e => setApplicantName(e.target.value)}
                placeholder="Applicant name"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c5f135] transition-colors" />
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                placeholder="Job title"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c5f135] transition-colors" />
            </div>
            <button onClick={handleSend} disabled={sending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#c5f135] text-[#0f0f0f] font-bold text-sm rounded-xl hover:bg-[#d4ff3a] transition-all disabled:opacity-60 shadow-[0_0_15px_rgba(197,241,53,0.2)]">
              {sending ? <FiLoader size={14} className="animate-spin" /> : <FiSend size={14} />}
              {sending ? 'Sending...' : 'Send Email'}
            </button>
            {msg && (
              <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border ${msg.startsWith('success') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {msg.startsWith('success') ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
                {msg.split(':')[1]}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplates;
