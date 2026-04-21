import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
import { FiBriefcase, FiFileText, FiUserCheck, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import PostJobModal from '../../components/PostJobModal';
import ResumePreviewModal from '../../components/ResumePreviewModal';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    jobs: [],
    applications: [],
    stats: { totalJobs: 0, totalApplications: 0, shortlistedCount: 0, acceptedCount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [isPostJobModalOpen, setPostJobModalOpen] = useState(false);
  const [resumeModal, setResumeModal] = useState<{
    open: boolean; name: string; email: string; resume: string; resumes: any[];
  }>({ open: false, name: '', email: '', resume: '', resumes: [] });

  const openResumeModal = (app: any) => {
    setResumeModal({
      open: true,
      name: app.seekerId?.name || 'Applicant',
      email: app.seekerId?.email || '',
      resume: app.seekerId?.resume || '',
      resumes: app.seekerId?.resumes || [],
    });
  };

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      // FIX: Use normal quotes, not backticks, for template string in TSX
      const res = await axios.get(`/jobs/employer/${user._id}`);
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const updateApplicationStatus = async (appId: string, status: string) => {
    try {
      // FIX: Use normal quotes, not backticks, for template string in TSX
      await axios.put(`/jobs/applications/${appId}/status`, { status });
      fetchDashboardData(); // Refresh to update counts and status
    } catch (error) {
      console.error('Failed to update status', error);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'Under Review': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Shortlisted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Accepted': return 'bg-green-500/10 text-[#4dff91] border-green-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  const stats = [
    { label: "Total Jobs Posted", value: data.stats.totalJobs, icon: FiBriefcase, color: "text-blue-400" },
    { label: "Applications Received", value: data.stats.totalApplications, icon: FiFileText, color: "text-purple-400" },
    { label: "Shortlisted", value: data.stats.shortlistedCount, icon: FiUserCheck, color: "text-yellow-400" },
    { label: "Accepted", value: data.stats.acceptedCount, icon: FiCheckCircle, color: "text-[#4dff91]" }
  ];


  // --- Analytics Data ---
  // Applications per job (bar chart)
  const jobTitles = data.jobs.map((job: any) => job.title);
  const applicationsPerJob = jobTitles.map(
    (title: string, idx: number) =>
      data.applications.filter((app: any) => app.jobId?.title === title).length
  );

  // Status distribution (pie chart)
  const statusCounts: Record<string, number> = {};
  data.applications.forEach((app: any) => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  });

  const statusLabels = Object.keys(statusCounts);
  const statusData = Object.values(statusCounts);

  if (loading) {
    return <div className="text-[#a0a0a0] flex justify-center py-20">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 text-white max-w-7xl mx-auto">
      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#181818] border border-[#232323] rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-[#c5f135]">Applications per Job</h3>
          {jobTitles.length > 0 ? (
            <Bar
              data={{
                labels: jobTitles,
                datasets: [
                  {
                    label: 'Applications',
                    data: applicationsPerJob,
                    backgroundColor: '#c5f135',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                },
                scales: {
                  x: { ticks: { color: '#a0a0a0' }, grid: { color: '#232323' } },
                  y: { ticks: { color: '#a0a0a0' }, grid: { color: '#232323' }, beginAtZero: true },
                },
              }}
              height={220}
            />
          ) : (
            <div className="text-[#a0a0a0] text-center py-10">No jobs to show analytics yet.</div>
          )}
        </div>
        <div className="bg-[#181818] border border-[#232323] rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-[#c5f135]">Application Status Distribution</h3>
          {statusLabels.length > 0 ? (
            <Pie
              data={{
                labels: statusLabels,
                datasets: [
                  {
                    data: statusData,
                    backgroundColor: [
                      '#c5f135',
                      '#4dff91',
                      '#40a9ff',
                      '#ff4d4d',
                      '#ffe066',
                      '#a0a0a0',
                    ],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    labels: { color: '#a0a0a0', font: { size: 14 } },
                  },
                },
              }}
              height={220}
            />
          ) : (
            <div className="text-[#a0a0a0] text-center py-10">No applications to show analytics yet.</div>
          )}
        </div>
      </div>
       {/* Header */}
       <div className="flex justify-between items-end">
          <div>
             <h2 className="text-3xl font-bold mb-1">Overview</h2>
             <p className="text-[#a0a0a0]">Here's what's happening with your job postings.</p>
          </div>
          <button 
            onClick={() => setPostJobModalOpen(true)}
            className="bg-[#c5f135] text-[#0f0f0f] font-bold px-6 py-2.5 rounded-lg flex gap-2 items-center hover:bg-[#d4ff3a] transition-all focus:ring-2 focus:ring-[#c5f135]"
          >
             <FiBriefcase /> Post a Job
          </button>
       </div>

       {/* Stats Row */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((stat, idx) => {
           const Icon = stat.icon;
           return (
             <div key={idx} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-[#c5f135]/50 transition-all cursor-default">
                <div className="flex items-start justify-between mb-4">
                   <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center border border-[#2a2a2a] z-10 group-hover:scale-110 transition-transform">
                      <Icon className={`text-xl ${stat.color}`} />
                   </div>
                </div>
                <div className="z-10">
                   <h3 className="text-4xl font-bold mb-1">{stat.value}</h3>
                   <p className="text-[#a0a0a0] font-medium text-sm">{stat.label}</p>
                </div>
             </div>
           )
         })}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Your Jobs List */}
        <div className="lg:col-span-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-6 border-b border-[#2a2a2a] bg-[#111111]/30">
              <h3 className="text-xl font-bold mb-1">Your Job Listings</h3>
          </div>
          <div className="overflow-y-auto scrollbar-thin p-4 space-y-3">
            {data.jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" alt="No jobs" className="w-16 h-16 mb-3 opacity-60" />
                <p className="text-[#a0a0a0] text-base font-medium">No jobs posted yet.<br/>Click <span className='text-[#c5f135] font-bold'>Post a Job</span> to get started!</p>
              </div>
            ) : (
              data.jobs.map((job: any) => (
                <div key={job._id} className="p-4 border border-[#2a2a2a] rounded-xl bg-gradient-to-br from-[#181818] to-[#111] hover:border-[#c5f135]/70 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-white leading-tight text-lg group-hover:text-[#c5f135] transition-colors">{job.title}</h4>
                      <div className="text-xs text-[#c5f135] font-semibold mt-0.5">{job.company}</div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${job.status === 'Open' ? 'text-[#c5f135] bg-[#c5f135]/10' : 'text-gray-500 bg-gray-500/10'}`}>{job.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-[#a0a0a0] mb-1">
                    <span className="bg-[#232323] px-2 py-0.5 rounded">{job.type}</span>
                    <span className="bg-[#232323] px-2 py-0.5 rounded">{job.location}</span>
                    {job.salary && <span className="bg-[#232323] px-2 py-0.5 rounded">{job.salary}</span>}
                  </div>
                  <div className="text-xs text-[#a0a0a0] mt-1">Posted on {new Date(job.createdAt).toLocaleDateString()}</div>
                  <div className="mt-2 text-sm text-[#e0e0e0] line-clamp-2">{job.description}</div>
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {job.requirements.map((req: string, idx: number) => (
                        <span key={idx} className="bg-[#232323] text-[#c5f135] px-2 py-0.5 rounded text-xs">{req}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Applications Table */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-6 border-b border-[#2a2a2a] flex justify-between items-center bg-[#111111]/30">
              <h3 className="text-xl font-bold">Recent Applications</h3>
          </div>
          <div className="overflow-y-auto overflow-x-auto scrollbar-thin">
            {data.applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <img src="https://cdn-icons-png.flaticon.com/512/5957/5957331.png" alt="No applications" className="w-16 h-16 mb-3 opacity-60" />
                <p className="text-[#a0a0a0] text-base font-medium">No applications received yet.<br/>Share your job to attract top talent!</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#111111]/80 text-[#a0a0a0] text-sm border-b border-[#2a2a2a]">
                    <th className="p-4 font-medium tracking-wide">Applicant</th>
                    <th className="p-4 font-medium tracking-wide">Job Applied For</th>
                    <th className="p-4 font-medium tracking-wide">Status</th>
                    <th className="p-4 font-medium tracking-wide text-center">Resume</th>
                    <th className="p-4 font-medium tracking-wide text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.applications.map((app: any) => (
                    <tr key={app._id} className="border-b border-[#2a2a2a] hover:bg-[#181c1c] transition-colors group">
                      <td className="p-4 flex items-center gap-3">
                        {app.seekerId?.profilePhoto ? (
                          <img src={app.seekerId.profilePhoto} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-[#2a2a2a] shadow-md" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#232323] to-[#0f0f0f] border border-[#2a2a2a] flex items-center justify-center text-lg font-bold text-white shadow-inner uppercase">
                            {app.seekerId?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold block text-white group-hover:text-[#c5f135] transition-colors">{app.seekerId?.name || 'Deleted User'}</span>
                          <span className="text-xs text-[#a0a0a0]">{app.seekerId?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-[#e0e0e0] font-medium">{app.jobId?.title || 'Deleted Job'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide inline-flex items-center gap-1.5 ${getStatusBadge(app.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span> {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => openResumeModal(app)}
                          title={app.seekerId?.resume ? 'View Resume' : 'No resume uploaded'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            app.seekerId?.resume
                              ? 'bg-[#c5f135]/10 text-[#c5f135] border-[#c5f135]/30 hover:bg-[#c5f135]/20 hover:shadow-[0_0_12px_rgba(197,241,53,0.2)]'
                              : 'bg-[#1a1a1a] text-[#505050] border-[#2a2a2a] cursor-default'
                          }`}
                        >
                          <FiFileText size={12} />
                          {app.seekerId?.resume ? 'View' : 'None'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={app.status}
                          onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                          className="px-3 py-1.5 bg-[#111] border border-[#2a2a2a] text-[#a0a0a0] text-xs font-bold rounded outline-none focus:border-[#c5f135] hover:border-[#c5f135] transition-all"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlist</option>
                          <option value="Accepted">Accept</option>
                          <option value="Rejected">Reject</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
       </div>

       {/* Sub-components */}
       <PostJobModal
          isOpen={isPostJobModalOpen}
          onClose={() => setPostJobModalOpen(false)}
          onJobPosted={fetchDashboardData}
       />
       <ResumePreviewModal
          isOpen={resumeModal.open}
          onClose={() => setResumeModal((p) => ({ ...p, open: false }))}
          applicantName={resumeModal.name}
          applicantEmail={resumeModal.email}
          resume={resumeModal.resume}
          resumes={resumeModal.resumes}
       />
    </div>
  );
};

export default EmployerDashboard;
