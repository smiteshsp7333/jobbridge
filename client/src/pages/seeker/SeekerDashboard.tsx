import React, { useState } from 'react';
import { FiClock, FiMapPin, FiBriefcase, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import JobModal, { type JobDetails } from '../../components/JobModal';

const SeekerDashboard = () => {
  const { user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tips = [
    { title: "How to write a great resume that stands out", time: "5 min read" },
    { title: "Ace your job assessment and technical rounds", time: "7 min read" },
    { title: "Negotiating your first salary", time: "4 min read" },
    { title: "Red flags to look out for in job descriptions", time: "6 min read" }
  ];

  const recentJobs: JobDetails[] = [
      { id: 1, title: 'Frontend Developer', company: 'Tech Corp', location: 'Remote', type: 'Full-time', salary: '₹12L - ₹18L', posted: '2 days ago', logo: 'T' },
      { id: 2, title: 'Backend Engineer', company: 'Global Innovate', location: 'Bangalore', type: 'Full-time', salary: '₹15L - ₹22L', posted: '3 hours ago', logo: 'G' },
      { id: 3, title: 'UI/UX Designer', company: 'Creative Studio', location: 'Mumbai', type: 'Contract', salary: '₹8L - ₹12L', posted: '1 day ago', logo: 'C' },
  ];

  const handleOpenJob = (job: JobDetails) => {
      setSelectedJob(job);
      setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
       {/* Main Area */}
       <div className="flex-1 space-y-6">
         {/* Welcome Card */}
         <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
               <h2 className="text-2xl font-bold mb-4">Welcome back, {user?.name || 'Job Seeker'}!</h2>
               <div className="mb-2 flex justify-between text-sm">
                  <span className="text-[#a0a0a0]">Profile Completeness</span>
                  <span className="text-[#c5f135] font-bold">{user?.profileComplete || 0}%</span>
               </div>
               <div className="w-full bg-[#111111] rounded-full h-3">
                  <div className="bg-[#c5f135] h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${user?.profileComplete || 0}%` }}></div>
               </div>
            </div>
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-[#c5f135]/5 rounded-full blur-3xl z-0"></div>
         </div>

         {/* Activity Feed */}
         <div>
            <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
               Recent Job Postings
               <button className="text-sm text-[#c5f135] hover:underline flex items-center gap-1 font-medium">View all <FiArrowRight /></button>
            </h3>
            <div className="space-y-4">
               {recentJobs.map(job => (
                 <div key={job.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 shadow-sm hover:border-[#c5f135]/30 transition-all flex flex-col md:flex-row md:justify-between md:items-center gap-4 group">
                    <div className="flex gap-4 items-start md:items-center w-full">
                       <div className="min-w-12 h-12 rounded-full bg-[#111111] border border-[#2a2a2a] flex items-center justify-center font-bold text-[#a0a0a0] group-hover:text-[#c5f135] group-hover:border-[#c5f135]/50 transition-colors">
                          {job.logo}
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-lg leading-tight mb-1">{job.title}</h4>
                          <p className="text-[#a0a0a0] flex flex-wrap items-center gap-2 text-sm">
                             <span className="flex items-center gap-1 text-white"><FiBriefcase className="text-[#c5f135]"/> {job.company}</span> 
                             <span className="text-[#2a2a2a] hidden md:inline">•</span>
                             <span className="flex items-center gap-1"><FiMapPin /> {job.location}</span>
                          </p>
                       </div>
                    </div>
                    <div className="flex justify-between md:flex-col items-center md:items-end gap-2 w-full md:w-auto">
                       <span className="text-xs text-[#a0a0a0] flex items-center gap-1"><FiClock /> {job.posted}</span>
                       <button onClick={() => handleOpenJob(job)} className="px-4 py-2 border border-[#c5f135] text-[#c5f135] rounded-lg text-sm hover:bg-[#c5f135] hover:text-[#0f0f0f] transition-all font-semibold w-full md:w-auto shadow-[0_0_10px_rgba(197,241,53,0)] hover:shadow-[0_0_15px_rgba(197,241,53,0.3)]">View Job</button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
       </div>

       {/* Right Sidebar */}
       <div className="w-full lg:w-[300px] space-y-6">
         <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-[#c5f135]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#c5f135]/20">
               <FiBriefcase className="text-2xl text-[#c5f135]" />
            </div>
            <h4 className="font-bold mb-1 text-lg">JobBridge Pro</h4>
            <p className="text-sm text-[#a0a0a0] mb-4">Unlock premium features and stand out to top employers.</p>
            <button className="w-full bg-[#c5f135] text-[#0f0f0f] font-bold py-2.5 rounded-lg hover:bg-[#d4ff3a] transition-colors">Upgrade to Pro</button>
         </div>

         <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <h4 className="font-bold border-b border-[#2a2a2a] pb-3 mb-4">Latest Tips</h4>
            <div className="space-y-4">
               {tips.map((tip, idx) => (
                 <div key={idx} className="group cursor-pointer">
                    <h5 className="text-sm font-medium group-hover:text-[#c5f135] transition-colors mb-1">{tip.title}</h5>
                    <p className="text-xs text-[#a0a0a0]">{tip.time}</p>
                 </div>
               ))}
            </div>
         </div>
       </div>

       <JobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} job={selectedJob} />
    </div>
  )
}

export default SeekerDashboard;