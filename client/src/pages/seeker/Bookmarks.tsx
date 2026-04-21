import React, { useState } from 'react';
import { FiMapPin, FiClock, FiBookmark, FiBriefcase, FiCornerRightUp, FiMoreHorizontal } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import JobModal, { type JobDetails } from '../../components/JobModal';

const Bookmarks = () => {
    const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [bookmarks, setBookmarks] = useState<JobDetails[]>([
        {
            id: 1,
            title: 'Senior Frontend Engineer',
            company: 'TechCorp India',
            logo: 'T',
            location: 'Bangalore (Remote)',
            type: 'Full-time',
            salary: '₹18L - ₹24L',
            posted: '2 days ago',
            match: 94
        },
        {
            id: 2,
            title: 'Full Stack MERN Developer',
            company: 'StartupX',
            logo: 'S',
            location: 'Gurgaon, Haryana',
            type: 'Full-time',
            salary: '₹14L - ₹20L',
            posted: '5 days ago',
            match: 88
        },
        {
            id: 3,
            title: 'React Native Developer',
            company: 'MobileFirst',
            logo: 'M',
            location: 'Pune, Maharashtra',
            type: 'Contract',
            salary: '₹10L - ₹15L',
            posted: '1 week ago',
            match: 82
        },
        {
            id: 4,
            title: 'UI/UX Designer & Engineer',
            company: 'Creative Studio',
            logo: 'C',
            location: 'Mumbai (Hybrid)',
            type: 'Full-time',
            salary: '₹12L - ₹18L',
            posted: '3 days ago',
            match: 75
        }
    ]);

    const removeBookmark = (id: number) => {
        setBookmarks(bookmarks.filter(b => b.id !== id));
    };

    const handleOpenJob = (job: JobDetails) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-6 pb-20 md:pb-0 h-full overflow-y-auto relative">
            {/* Header */}
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5f135]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold mb-2">Saved Jobs</h1>
                    <p className="text-[#a0a0a0] mb-4 text-sm max-w-lg">Keep track of the opportunities you are interested in. Bookmarks are private and only visible to you. Jobs will automatically be removed if the employer closes the listing.</p>
                    <div className="inline-flex items-center gap-2 bg-[#111111] border border-[#2a2a2a] px-4 py-2 rounded-lg">
                        <FiBookmark className="text-[#c5f135]" />
                        <span className="font-bold text-white">{bookmarks.length}</span>
                        <span className="text-[#a0a0a0] text-sm">Active Bookmarks</span>
                    </div>
                </div>
            </div>

            {/* Grid Layout for Bookmarks */}
            {bookmarks.length === 0 ? (
                <div className="flex-1 border border-dashed border-[#2a2a2a] rounded-xl flex flex-col justify-center items-center p-12 text-center">
                    <div className="w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center text-[#555] mb-4">
                        <FiBookmark size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No saved jobs yet</h3>
                    <p className="text-[#a0a0a0] max-w-sm mb-6">Jobs you bookmark will appear here so you can easily find them later and apply when you are ready.</p>
                    <button className="bg-[#c5f135] text-[#0f0f0f] px-6 py-3 rounded-lg font-bold hover:bg-[#d4ff3a] transition-all">
                        Browse Jobs
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {bookmarks.map(job => (
                        <div key={job.id} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5 hover:border-[#c5f135]/50 transition-all flex flex-col group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-[#111111] rounded-xl border border-[#2a2a2a] flex items-center justify-center text-xl font-black text-[#c5f135]">
                                        {job.logo}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-[#c5f135] transition-colors">{job.title}</h3>
                                        <p className="text-sm text-[#a0a0a0]">{job.company}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeBookmark(job.id)}
                                    className="text-[#c5f135] hover:text-white p-1"
                                    title="Remove Bookmark"
                                >
                                    <FiBookmark className="fill-current" size={20} />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="bg-[#111111] text-[#a0a0a0] px-2.5 py-1 rounded text-xs font-medium border border-[#2a2a2a] flex items-center gap-1.5"><FiBriefcase /> {job.type}</span>
                                <span className="bg-[#111111] text-[#a0a0a0] px-2.5 py-1 rounded text-xs font-medium border border-[#2a2a2a] flex items-center gap-1.5"><FiMapPin /> {job.location}</span>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="flex justify-between items-center sm:items-end">
                                    <div>
                                        <p className="text-[#a0a0a0] text-xs mb-0.5">Salary Match</p>
                                        <p className="text-white font-bold flex items-center gap-1"><FaRupeeSign className="text-[#a0a0a0]" size={12}/>{job.salary}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#a0a0a0] text-xs mb-0.5">Match Score</p>
                                        <p className="text-[#c5f135] font-bold">{job.match}%</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#2a2a2a] flex gap-2">
                                    <button onClick={() => handleOpenJob(job)} className="flex-1 bg-[#c5f135] text-[#0f0f0f] py-2.5 rounded-lg font-bold text-sm hover:bg-[#d4ff3a] transition-all flex items-center justify-center gap-2">
                                        Apply Now <FiCornerRightUp />
                                    </button>
                                    <button className="w-10 h-10 bg-[#111111] border border-[#2a2a2a] rounded-lg text-[#a0a0a0] hover:text-white flex items-center justify-center transition-all">
                                        <FiMoreHorizontal />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <JobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} job={selectedJob} />
        </div>
    );
};

export default Bookmarks;