import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

export interface JobDetails {
    id: number | string;
    title: string;
    company: string;
    logo?: string;
    location: string;
    type: string;
    salary: string;
    posted: string;
    description?: string;
    requirements?: string[];
}

interface JobModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: JobDetails | null;
}

const JobModal = ({ isOpen, onClose, job }: JobModalProps) => {
    const { user } = useAuth();
    const [applied, setApplied] = useState(false);
    const [applying, setApplying] = useState(false);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset' };
    }, [isOpen]);

    // Reset applied state when job changes
    useEffect(() => {
        setApplied(false);
        setApplying(false);
    }, [job]);

    if (!job) return null;

    const handleApply = async () => {
        if (!user || applying) return;
        setApplying(true);
        try {
            await axios.post('/jobs/apply', {
                userEmail: user.email,
                jobTitle: job.title,
                companyName: job.company
            });
            setApplied(true);
        } catch (error) {
            console.error('Error applying for job:', error);
        } finally {
            setApplying(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#0f0f0f]/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-3xl max-h-[90vh] bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 p-6 border-b border-[#2a2a2a] flex justify-between items-start relative overflow-hidden">
                            {/* decorative blur */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5f135]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                            <div className="flex gap-5 relative z-10">
                                <div className="w-16 h-16 bg-[#111111] rounded-xl border border-[#2a2a2a] flex items-center justify-center text-3xl font-black text-[#c5f135] shadow-lg flex-shrink-0">
                                    {job.logo || job.company.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white leading-tight">{job.title}</h2>
                                    <p className="text-lg text-[#a0a0a0] mb-3">{job.company}</p>
                                    <div className="flex flex-wrap gap-3 text-sm text-[#d0d0d0]">
                                        <span className="flex items-center gap-1.5 bg-[#111111] px-2.5 py-1 rounded border border-[#2a2a2a]"><FiBriefcase className="text-[#a0a0a0]"/> {job.type}</span>
                                        <span className="flex items-center gap-1.5 bg-[#111111] px-2.5 py-1 rounded border border-[#2a2a2a]"><FiMapPin className="text-[#a0a0a0]" /> {job.location}</span>
                                        <span className="flex items-center gap-1.5 bg-[#111111] px-2.5 py-1 rounded border border-[#2a2a2a]"><FaRupeeSign className="text-[#a0a0a0]" /> {job.salary}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={onClose}
                                className="relative z-10 p-2 text-[#a0a0a0] hover:text-white hover:bg-[#2a2a2a] rounded-xl transition-colors"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-[#c5f135] font-bold text-lg mb-2">Job Description</h3>
                                <p className="text-[#d0d0d0] leading-relaxed mb-6">
                                    {job.description || 
                                    `We are looking for a highly skilled and motivated ${job.title} to join our growing team at ${job.company}. You will be responsible for developing and designing front-end web architecture, ensuring the responsiveness of applications, and working alongside graphic designers for web design features. You will be required to see out a project from conception to final product, requiring good organizational skills and attention to detail.`}
                                </p>

                                <h3 className="text-[#c5f135] font-bold text-lg mb-2">Key Responsibilities & Requirements</h3>
                                <ul className="list-disc pl-5 text-[#d0d0d0] space-y-2 mb-6">
                                    {job.requirements ? job.requirements.map((req, i) => <li key={i}>{req}</li>) : (
                                        <>
                                            <li>3+ years of experience in modern web development.</li>
                                            <li>Strong proficiency in JavaScript, DOM manipulation, and object model.</li>
                                            <li>Thorough understanding of React.js and its core principles.</li>
                                            <li>Experience with popular React.js workflows (such as Flux or Redux).</li>
                                            <li>Familiarity with RESTful APIs and modern authorization mechanisms (e.g., JSON Web Token).</li>
                                        </>
                                    )}
                                </ul>

                                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2"><FiClock className="text-[#c5f135]" /> Posted</h4>
                                        <p className="text-sm text-[#a0a0a0]">{job.posted}</p>
                                    </div>
                                    <div className="w-full h-px sm:w-px sm:h-10 bg-[#2a2a2a]"></div>
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2"><FiBriefcase className="text-[#c5f135]" /> Experience</h4>
                                        <p className="text-sm text-[#a0a0a0]">Mid-Senior Level</p>
                                    </div>
                                    <div className="w-full h-px sm:w-px sm:h-10 bg-[#2a2a2a]"></div>
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2"><FaRupeeSign className="text-[#c5f135]" /> CTC</h4>
                                        <p className="text-sm text-[#a0a0a0]">{job.salary}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="flex-shrink-0 p-6 border-t border-[#2a2a2a] bg-[#111111] flex items-center justify-end gap-4">
                            <button onClick={onClose} className="px-6 py-2.5 text-[#a0a0a0] font-medium hover:text-white transition-colors">
                                Cancel
                            </button>
                            
                            {applied ? (
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="px-8 py-2.5 bg-[#c5f135]/20 text-[#c5f135] border border-[#c5f135]/50 rounded-lg font-bold flex items-center gap-2"
                                >
                                    <FiCheckCircle size={18} /> Application Sent!
                                </motion.div>
                            ) : (
                                <button 
                                    onClick={handleApply}
                                    disabled={applying}
                                    className={`px-8 py-2.5 bg-[#c5f135] text-[#0f0f0f] rounded-lg font-bold hover:bg-[#d4ff3a] hover:shadow-[0_0_15px_rgba(197,241,53,0.4)] transition-all flex items-center justify-center gap-2 relative overflow-hidden group ${applying ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                    {applying ? 'Applying...' : 'Quick Apply'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default JobModal;