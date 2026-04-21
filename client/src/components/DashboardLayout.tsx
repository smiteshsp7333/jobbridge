import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiBriefcase, FiUser, FiFileText, FiBookmark, FiFile, FiUsers, FiBell, FiLogOut, FiMail, FiSettings } from 'react-icons/fi';
import { useSocket } from '../context/useSocket';
import { useToast } from '../context/ToastContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState<{ id: number; text: string; time: string }[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const { showToast } = useToast();

  // F8 – Real-time Socket.io notifications
  useSocket((event, data) => {
    if (event === 'new_application') {
      const msg = `New application for "${data.jobTitle}" from ${data.userEmail}`;
      setNotifications(prev => [{ id: Date.now(), text: msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
      showToast(msg, 'info');
    }
    if (event === 'status_changed') {
      const msg = `Application status updated to "${data.status}"`;
      setNotifications(prev => [{ id: Date.now(), text: msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
      showToast(msg, 'success');
    }
  });

  const isSeeker = user?.role === 'seeker';

  const seekerLinks = [
    { name: 'Home', path: '/seeker/dashboard', icon: FiHome },
    { name: 'Job Profiles', path: '/seeker/jobs', icon: FiBriefcase },
    { name: 'My Profile', path: '/seeker/profile', icon: FiUser },
    { name: 'My Applications', path: '/seeker/applications', icon: FiFileText },
    { name: 'Bookmarks', path: '/seeker/bookmarks', icon: FiBookmark },
    { name: 'Resume', path: '/seeker/resume', icon: FiFile },
  ];

  const employerLinks = [
    { name: 'Dashboard', path: '/employer/dashboard', icon: FiHome },
    { name: 'My Jobs', path: '/employer/my-jobs', icon: FiBriefcase },
    { name: 'Applicants', path: '/employer/applicants', icon: FiUsers },
    { name: 'Email Templates', path: '/employer/email-templates', icon: FiMail },
    { name: 'Company Profile', path: '/employer/profile', icon: FiSettings },
  ];

  const navLinks = isSeeker ? seekerLinks : employerLinks;
  const unread = notifications.length;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-[240px] bg-[#111111] flex-col fixed h-full border-r border-[#2a2a2a] z-50">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tighter">Job<span className="text-[#c5f135]">Bridge</span></h1>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
          {navLinks.map(link => {
            const isActive = location.pathname.includes(link.path);
            const Icon = link.icon;
            return (
              <Link key={link.name} to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-[#1a1a1a] text-[#c5f135] border-l-4 border-[#c5f135]' : 'text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-white border-l-4 border-transparent'}`}>
                <Icon className="text-lg flex-shrink-0" />
                <span className="font-medium text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center font-bold text-[#c5f135] uppercase text-sm">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex flex-col truncate w-28">
              <span className="text-sm font-medium truncate capitalize">{user?.name || 'User'}</span>
              <span className="text-xs text-[#a0a0a0] capitalize">{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-[#a0a0a0] hover:text-red-400 transition-colors"><FiLogOut /></button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 md:ml-[240px] flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="min-h-[64px] bg-[#0f0f0f]/80 backdrop-blur-md border-b border-[#2a2a2a] flex items-center justify-between px-8 sticky top-0 z-40">
          <h2 className="text-lg font-semibold capitalize hidden sm:block">
            {location.pathname.split('/').pop()?.replace(/-/g, ' ')}
          </h2>
          <div className="flex items-center gap-3 ml-auto relative">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotif(v => !v); }}
                className="text-[#a0a0a0] hover:text-white relative p-2 transition-colors"
              >
                <FiBell className="text-xl" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#c5f135] text-[#0f0f0f] text-[9px] font-black flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#181818] border border-[#2a2a2a] rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
                    <span className="text-sm font-bold text-white">Notifications</span>
                    {unread > 0 && (
                      <button onClick={() => setNotifications([])} className="text-xs text-[#606060] hover:text-red-400 transition-colors">Clear all</button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-[#606060] text-sm py-8">No notifications yet</p>
                    ) : notifications.map(n => (
                      <div key={n.id} className="px-4 py-3 border-b border-[#1e1e1e] hover:bg-[#1e1e1e] transition-colors">
                        <p className="text-xs text-white leading-relaxed">{n.text}</p>
                        <p className="text-[10px] text-[#505050] mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-xs font-bold text-[#c5f135] uppercase">
              {user?.name?.[0] || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0f0f0f]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;