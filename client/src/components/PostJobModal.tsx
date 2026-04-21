import React, { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobPosted: () => void;
}

const PostJobModal: React.FC<PostJobModalProps> = ({ isOpen, onClose, onJobPosted }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary: '',
    type: 'Full-time',
    description: '',
    requirements: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const requirementsArray = formData.requirements
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      await axios.post('/jobs', {
        employerId: user._id,
        company: user.companyName || user.name,
        title: formData.title,
        location: formData.location,
        salary: formData.salary,
        type: formData.type,
        description: formData.description,
        requirements: requirementsArray,
        status: isDraft ? 'Draft' : 'Open',
      });

      showToast(`Job ${isDraft ? 'saved as draft' : 'published'} successfully`, 'success');
      onJobPosted();
      onClose();
      // Reset form
      setFormData({
        title: '', location: '', salary: '', type: 'Full-time', description: '', requirements: ''
      });
    } catch (error) {
      console.error('Error posting job:', error);
      showToast('Failed to post job. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#111111] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-[#2a2a2a] flex justify-between items-center sticky top-0 bg-[#111111] z-10">
            <h2 className="text-2xl font-bold text-white">Post a New Job</h2>
            <button onClick={onClose} className="p-2 text-[#a0a0a0] hover:text-white rounded-lg hover:bg-[#1a1a1a] transition-colors">
              <FiX size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto scrollbar-thin">
            <form id="post-job-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">Job Title *</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">Location *</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. Remote, New York, etc."
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">Salary Range</label>
                  <input 
                    type="text" 
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    placeholder="e.g. $100k - $130k"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">Job Type *</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] transition-colors"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-2">Job Description *</label>
                <textarea 
                  required 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the role, responsibilities..."
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-2">Requirements (One per line) *</label>
                <textarea 
                  required 
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  placeholder="3+ years React setup&#10;Deep Next.js knowledge"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] transition-colors resize-none"
                />
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-[#2a2a2a] bg-[#111111] flex justify-end gap-3 sticky bottom-0 z-10">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg font-bold text-[#a0a0a0] hover:text-white transition-colors">Cancel</button>
            <button
              type="button"
              onClick={() => { setIsDraft(true); document.getElementById('post-job-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); }}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg font-bold text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/10 transition-all disabled:opacity-70 text-sm"
            >
              Save as Draft
            </button>
            <button type="submit" form="post-job-form" onClick={() => setIsDraft(false)} disabled={isSubmitting}
              className="bg-[#c5f135] text-[#0f0f0f] font-bold px-8 py-2.5 rounded-lg hover:bg-[#d4ff3a] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? (isDraft ? 'Saving...' : 'Posting...') : 'Publish Job'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PostJobModal;