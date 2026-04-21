import React, { useState } from 'react';
import { FiBriefcase, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiMoreVertical, FiMapPin, FiDollarSign, FiSearch, FiFilter } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import JobModal, { type JobDetails } from '../../components/JobModal';

const MyApplications = () => {
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock data for applications
    const applications: any[] = [
        {
            id: 1,
            jobTitle: 'Senior Frontend Developer',
            company: 'TechFlow Solutions',
            logo: 'T',
            location: 'Bangalore, India (Remote)',
            salary: '₹18L - ₹24L',
            appliedDate: 'Oct 18, 2026',
            status: 'Interviewing', // 'Applied', 'Under Review', 'Interviewing', 'Rejected', 'Offered'
            matchScore: 92
        },
        {
            id: 2,
            jobTitle: 'React Native Engineer',
            company: 'AppVerse',
            logo: 'A',
            location: 'Mumbai, India',
            salary: '₹14L - ₹18L',
            appliedDate: 'Oct 15, 2026',
            status: 'Under Review',
            matchScore: 85
        },
        {
            id: 3,
            jobTitle: 'Full Stack Web Developer',
            company: 'GlobalTech Innovations',
            logo: 'G',
            location: 'Pune, India',
            salary: '₹12L - ₹16L',
            appliedDate: 'Oct 10, 2026',
            status: 'Applied',
            matchScore: 78
        },
        {
            id: 4,
            jobTitle: 'UI/UX Developer',
            company: 'DesignSpace',
            logo: 'D',
            location: 'Hyderabad, India (Hybrid)',
            salary: '₹10L - ₹15L',
            appliedDate: 'Oct 05, 2026',
            status: 'Rejected',
            matchScore: 65
        },
        {
            id: 5,
            jobTitle: 'Lead Software Engineer',
            company: 'FinTech Dynamics',
            logo: 'F',
            location: 'Gurgaon, India',
            salary: '₹25L - ₹35L',
            appliedDate: 'Oct 01, 2026',
            status: 'Offered',
            matchScore: 95
        }
    ];

    const handleOpenJob = (app: any) => {
        setSelectedJob({
            id: app.id,
            title: app.jobTitle,
            company: app.company,
            logo: app.logo,
            location: app.location,
            type: 'Full-time', // Mock default
            salary: app.salary,
            posted: app.appliedDate
        });
        setIsModalOpen(true);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Applied': return 'bg-[#1a1a1a] text-[#a0a0a0] border-[#2a2a2a]';
            case 'Under Review': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
            case 'Interviewing': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'Offered': return 'bg-[#c5f135]/10 text-[#c5f135] border-[#c5f135]/30';
            case 'Rejected': return 'bg-red-500/10 text-red-500 border-red-500/30';
            default: return 'bg-[#1a1a1a] text-[#a0a0a0] border-[#2a2a2a]';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Applied': return <FiClock />;
            case 'Under Review': return <FiAlertCircle />;
            case 'Interviewing': return <FiBriefcase />;
            case 'Offered': return <FiCheckCircle />;
            case 'Rejected': return <FiXCircle />;
            default: return <FiClock />;
        }
    };

    const filteredApps = applications.filter(app => {
        const matchesFilter = filter === 'All' || app.status === filter;
        const matchesSearch = app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              app.company.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Summary calculations
    const totalApps = applications.length;
    const interviewingApps = applications.filter(a => a.status === 'Interviewing' || a.status === 'Offered').length;
    const reviewApps = applications.filter(a => a.status === 'Under Review').length;

    return (
        <div className="flex flex-col gap-6 pb-20 md:pb-0 h-full overflow-y-auto">
            {/* Header & Stats */}
            <div>
                <h1 className="text-2xl font-bold mb-2">My Applications</h1>
                <p className="text-[#a0a0a0] mb-6">Track and manage your job applications and their current statuses.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#111111] rounded-full border border-[#2a2a2a] flex items-center justify-center text-[#c5f135]">
                            <FiBriefcase size={20} />
                        </div>
                        <div>
                            <p className="text-[#a0a0a0] text-sm">Total Applied</p>
                            <h3 className="text-2xl font-bold">{totalApps}</h3>
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <FiCheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-[#a0a0a0] text-sm">Interviewing / Offered</p>
                            <h3 className="text-2xl font-bold">{interviewingApps}</h3>
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-full border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                            <FiAlertCircle size={20} />
                        </div>
                        <div>
                            <p className="text-[#a0a0a0] text-sm">Under Review</p>
                            <h3 className="text-2xl font-bold">{reviewApps}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded-xl">
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    {['All', 'Applied', 'Under Review', 'Interviewing', 'Offered', 'Rejected'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                filter === tab 
                                ? 'bg-[#c5f135] text-[#0f0f0f]' 
                                : 'text-[#a0a0a0] hover:text-white hover:bg-[#111111]'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                <div className="relative w-full sm:w-64">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0a0]" />
                    <input 
                        type="text" 
                        placeholder="Search applications..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#c5f135]"
                    />
                </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {filteredApps.length === 0 ? (
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center text-[#a0a0a0] mb-4">
                            <FiBriefcase size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No applications found</h3>
                        <p className="text-[#a0a0a0] text-sm">You haven't applied to any jobs with this status yet.</p>
                    </div>
                ) : (
                    filteredApps.map(app => (
                        <div key={app.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-all group flex flex-col md:flex-row gap-6 items-start md:items-center">
                            {/* Company Logo */}
                            <div className="w-14 h-14 bg-[#111111] rounded-xl border border-[#2a2a2a] flex items-center justify-center text-xl font-bold text-[#c5f135] flex-shrink-0">
                                {app.logo}
                            </div>
                            
                            {/* Job Details */}
                            <div className="flex-1 space-y-2 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <h3 className="font-bold text-lg">{app.jobTitle}</h3>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(app.status)} w-fit`}>
                                        {getStatusIcon(app.status)}
                                        <span>{app.status}</span>
                                    </div>
                                </div>
                                <div className="text-sm font-medium">{app.company}</div>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-[#a0a0a0]">
                                    <div className="flex items-center gap-1"><FiMapPin /> {app.location}</div>
                                    <div className="flex items-center gap-1"><FaRupeeSign /> {app.salary}</div>
                                    <div className="flex items-center gap-1"><FiClock /> Applied {app.appliedDate}</div>
                                </div>
                            </div>
                            
                            {/* Actions / Secondary details */}
                            <div className="flex w-full md:w-auto md:flex-col items-center md:items-end justify-between gap-4 border-t border-[#2a2a2a] md:border-t-0 pt-4 md:pt-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#a0a0a0]">Match:</span>
                                    <span className="text-sm font-bold text-[#c5f135]">{app.matchScore}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleOpenJob(app)} className="px-4 py-2 border border-[#2a2a2a] text-sm text-white rounded-lg hover:bg-[#111111] hover:border-[#c5f135]/50 transition-all">
                                        View Job
                                    </button>
                                    <button className="p-2 border border-[#2a2a2a] text-[#a0a0a0] rounded-lg hover:text-white hover:bg-[#111111] transition-colors">
                                        <FiMoreVertical />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <JobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} job={selectedJob} />
        </div>
    );
};

export default MyApplications;