import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import SeekerDashboard from './pages/seeker/SeekerDashboard'
import JobListings from './pages/seeker/JobListings'
import Profile from './pages/seeker/Profile'
import MyApplications from './pages/seeker/MyApplications'
import Bookmarks from './pages/seeker/Bookmarks'
import Resume from './pages/seeker/Resume'
import EmployerDashboard from './pages/employer/EmployerDashboard'
import { Suspense, lazy } from 'react'
const PostJob = lazy(() => import('./pages/employer/PostJob'));
const MyJobs = lazy(() => import('./pages/employer/MyJobs'));
const Applicants = lazy(() => import('./pages/employer/Applicants'));
const EmployerProfile = lazy(() => import('./pages/employer/EmployerProfile'));
const EmailTemplates = lazy(() => import('./pages/employer/EmailTemplates'));
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Seeker Routes */}
            <Route path="seeker/dashboard" element={
              <ProtectedRoute requiredRole="seeker">
                <SeekerDashboard />
              </ProtectedRoute>
            } />
            <Route path="seeker/jobs" element={
              <ProtectedRoute requiredRole="seeker">
                <JobListings />
              </ProtectedRoute>
            } />
            <Route path="seeker/profile" element={
              <ProtectedRoute requiredRole="seeker">
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="seeker/applications" element={
              <ProtectedRoute requiredRole="seeker">
                <MyApplications />
              </ProtectedRoute>
            } />
            <Route path="seeker/bookmarks" element={
              <ProtectedRoute requiredRole="seeker">
                <Bookmarks />
              </ProtectedRoute>
            } />
            <Route path="seeker/resume" element={
              <ProtectedRoute requiredRole="seeker">
                <Resume />
              </ProtectedRoute>
            } />
            
            {/* Employer Routes */}
            <Route path="employer/dashboard" element={
              <ProtectedRoute requiredRole="employer">
                <EmployerDashboard />
              </ProtectedRoute>
            } />
            <Route path="employer/post-job" element={
              <ProtectedRoute requiredRole="employer">
                <Suspense fallback={<div className="text-[#a0a0a0] p-10">Loading...</div>}>
                  <PostJob />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="employer/my-jobs" element={
              <ProtectedRoute requiredRole="employer">
                <Suspense fallback={<div className="text-[#a0a0a0] p-10">Loading...</div>}>
                  <MyJobs />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="employer/applicants" element={
              <ProtectedRoute requiredRole="employer">
                <Suspense fallback={<div className="text-[#a0a0a0] p-10">Loading...</div>}>
                  <Applicants />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="employer/profile" element={
              <ProtectedRoute requiredRole="employer">
                <Suspense fallback={<div className="text-[#a0a0a0] p-10">Loading...</div>}>
                  <EmployerProfile />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="employer/email-templates" element={
              <ProtectedRoute requiredRole="employer">
                <Suspense fallback={<div className="text-[#a0a0a0] p-10">Loading...</div>}>
                  <EmailTemplates />
                </Suspense>
              </ProtectedRoute>
            } />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
  </StrictMode>,
)
