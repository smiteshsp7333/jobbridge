import { useState, useEffect } from 'react';
import { FiSearch, FiBriefcase, FiMapPin, FiClock, FiCheckCircle } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const JobListings = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
    const [isApplying, setIsApplying] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get('/jobs');
                setJobs(res.data);
                if (res.data.length > 0) {
                    setSelectedJobId(res.data[0]._id);
                }
            } catch (error) {
                console.error('Error fetching jobs', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchApplications = async () => {
            if (!user) return;
            try {
                // To fetch applied jobs, we might not have a /users/:id/applications route 
                // in the current backend but we can safely just try 
                const res = await axios.get(`/users/${user._id}/applications`);
                setAppliedJobs(res.data.map((app: any) => app.jobId));
            } catch (error) {
                console.error("Failed to fetch applications", error);
            }
        }

        fetchJobs();
        fetchApplications();
    }, [user]);

    const filteredJobs = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedJob = jobs.find(j => j._id === selectedJobId);
    const hasApplied = appliedJobs.includes(selectedJob?._id);

    const handleApply = async () => {
        if (!selectedJob || hasApplied || !user) return;
        setIsApplying(true);
        try {
            await axios.post('/jobs/apply', {
                jobId: selectedJob._id,
                seekerId: user._id,
                employerId: selectedJob.employerId?._id || selectedJob.employerId,
                userEmail: user.email,
                jobTitle: selectedJob.title,
                companyName: selectedJob.company
            });
            setAppliedJobs([...appliedJobs, selectedJob._id]);
            alert('Application submitted successfully!');
        } catch (error: any) {
            console.error('Application failed:', error);
            alert(error.response?.data?.message || 'Failed to submit application.');
        } finally {
            setIsApplying(false);
        }
    };

    if (loading) {
        return <div className="text-[#a0a0a0] flex justify-center py-20">Loading jobs...</div>;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Left Panel: Job List */}
            <div className="w-full lg:w-[400px] flex flex-col h-full bg-[#111111] rounded-2xl border border-[#2a2a2a] overflow-hidden">
                {/* Search & Filters */}
                <div className="p-4 border-b border-[#2a2a2a] bg-[#1a1a1a]">
                    <div className="relative mb-3">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                        <input 
                            type="text" 
                            placeholder="Search title or company..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#c5f135] text-white transition-colors" 
                        />
                    </div>
                </div>

                {/* Scrollable Job List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
                    {filteredJobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#a0a0a0] gap-2 p-4 text-center">
                            <FiSearch size={24} />
                            <p className="text-sm">No jobs found matching "{searchQuery}"</p>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <div 
                                key={job._id} 
                                onClick={() => setSelectedJobId(job._id)}
                                className={`cursor-pointer p-4 rounded-xl border transition-all ${selectedJobId === job._id ? 'border-[#c5f135] bg-[#1a1a1a]' : 'border-transparent hover:bg-[#1a1a1a] hover:border-[#2a2a2a]'}`}
                            >
                                <div className="flex gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-[#0f0f0f] border border-[#2a2a2a] flex items-center justify-center font-bold text-[#c5f135] flex-shrink-0 line-clamp-1">
                                        {job.company?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold leading-tight line-clamp-1 text-white">{job.title}</h4>
                                        <p className="text-xs text-[#a0a0a0] line-clamp-1">{job.company} • {job.location}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <div className="flex items-center gap-2">
                                         <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold ${job.status === 'Open' ? 'bg-[#c5f135]/20 text-[#c5f135]' : 'bg-[#2a2a2a] text-[#a0a0a0]'}`}>
                                            {job.status}
                                         </span>
                                         {appliedJobs.includes(job._id) && <span className="text-[10px] text-[#4dff91] font-bold flex items-center"><FiCheckCircle className="mr-1"/> Applied</span>}
                                    </div>
                                    <span className="text-[10px] text-[#a0a0a0]">{new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel: Job Detail */}
            <div className="flex-1 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] flex flex-col h-full overflow-hidden relative">
                {selectedJob ? (
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={selectedJob._id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex flex-col h-full overflow-hidden absolute inset-0 text-white"
                        >
                            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                                <h2 className="text-3xl font-bold mb-2">{selectedJob.title}</h2>
                                <div className="flex flex-wrap gap-4 text-sm text-[#a0a0a0] mb-8 border-b border-[#2a2a2a] pb-6">
                                    <span className="flex items-center gap-1.5"><FiBriefcase className="text-[#c5f135]" /> {selectedJob.company}</span>
                                    <span className="flex items-center gap-1.5"><FiMapPin className="text-[#c5f135]" /> {selectedJob.location}</span>
                                    <span className="flex items-center gap-1.5"><FiClock className="text-[#c5f135]" /> {selectedJob.type}</span>
                                    {selectedJob.salary && <span className="flex items-center gap-1.5"><FaRupeeSign className="text-[#c5f135]" /> {selectedJob.salary}</span>}
                                </div>

                                <div className="space-y-6 pb-20">
                                    <div>
                                        <h3 className="text-xl font-bold mb-3">Job Description</h3>
                                        <p className="text-[#a0a0a0] text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                                            {selectedJob.description}
                                        </p>
                                        
                                        <h4 className="font-bold mb-2 text-white">Requirements:</h4>
                                        <ul className="list-disc pl-5 text-[#a0a0a0] text-sm space-y-1">
                                            {selectedJob.requirements?.map((req: string, i: number) => (
                                              <li key={i}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-[#111111] border-t border-[#2a2a2a] relative z-10 w-full flex items-center gap-4">
                                {hasApplied ? (
                                    <div className="w-full bg-[#1a1a1a] text-[#4dff91] border border-[#4dff91]/30 py-3 rounded-lg font-bold flex justify-center items-center gap-2">
                                        <FiCheckCircle size={20} /> Application Sent!
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleApply}
                                        disabled={isApplying || selectedJob.status === 'Closed'}
                                        className={`w-full py-3 rounded-lg font-bold transition-all relative overflow-hidden group flex items-center justify-center ${
                                            selectedJob.status === 'Closed' 
                                                ? 'bg-[#2a2a2a] text-[#a0a0a0] cursor-not-allowed'
                                                : isApplying 
                                                    ? 'bg-[#d4ff3a] text-[#0f0f0f]' 
                                                    : 'bg-[#c5f135] text-[#0f0f0f] hover:bg-[#d4ff3a] hover:shadow-[0_0_15px_rgba(197,241,53,0.3)]'
                                        }`}
                                    >
                                        {!isApplying && selectedJob.status !== 'Closed' && <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>}
                                        {isApplying ? 'Sending Application...' : selectedJob.status === 'Closed' ? 'Position Closed' : 'Apply Now'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <div className="flex w-full h-full items-center justify-center text-[#a0a0a0] flex-col gap-3">
                        <FiBriefcase className="text-4xl opacity-50" />
                        <p>Select a job to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobListings;