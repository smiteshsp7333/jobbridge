import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'seeker' | 'employer' | ''>('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!role) {
      setError('Please select a role');
      return;
    }
    try {
      // API call to be connected to the backend
      const res = await axios.post('/auth/register', {
        name, email, password, role, companyName: role === 'employer' ? companyName : undefined
      });
      login(res.data.token);
      navigate(role === 'seeker' ? '/seeker/dashboard' : '/employer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-white font-sans">
      {/* Left Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden text-center items-center justify-center"
        style={{ backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #0f0f0f 70%)' }}
      >
        <div className="z-10 flex flex-col items-center justify-center h-full space-y-6">
          <h1 className="text-6xl font-bold tracking-tighter">
            Job<span className="text-[#c5f135]">Bridge</span>
          </h1>
          <p className="text-2xl text-[#a0a0a0] font-light">Join the platform today</p>
          <p className="text-sm text-[#a0a0a0] max-w-md mt-4">Your next opportunity is one click away.</p>
        </div>
      </motion.div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-20 h-screen overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-2xl border border-[#2a2a2a] shadow-2xl my-auto"
        >
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-[#a0a0a0]">Fill in your details to register.</p>
          </div>

          {error && <div className="mb-4 text-[#ff4d4d] text-sm text-center">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Role Selection */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole('seeker')}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border ${role === 'seeker' ? 'border-[#c5f135] text-[#c5f135] bg-[#111111]' : 'border-[#2a2a2a] text-[#a0a0a0] bg-[#1a1a1a] hover:border-[#c5f135]/50'} transition-all text-sm font-medium`}
              >
                <FiUser className="text-2xl mb-2" />
                I'm a Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border ${role === 'employer' ? 'border-[#c5f135] text-[#c5f135] bg-[#111111]' : 'border-[#2a2a2a] text-[#a0a0a0] bg-[#1a1a1a] hover:border-[#c5f135]/50'} transition-all text-sm font-medium`}
              >
                <FiBriefcase className="text-2xl mb-2" />
                I'm an Employer
              </button>
            </div>

            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] focus:ring-1 focus:ring-[#c5f135] transition-all"
                placeholder="Full Name"
              />
            </div>
            
            {role === 'employer' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] focus:ring-1 focus:ring-[#c5f135] transition-all"
                  placeholder="Company Name"
                />
              </motion.div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] focus:ring-1 focus:ring-[#c5f135] transition-all"
                placeholder="Email Address"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] focus:ring-1 focus:ring-[#c5f135] transition-all"
                placeholder="Password"
              />
            </div>
            
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] focus:ring-1 focus:ring-[#c5f135] transition-all"
                placeholder="Confirm Password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#c5f135] text-black font-semibold rounded-lg px-4 py-3 hover:bg-[#b0d92e] transition-colors mt-4 shadow-[0_0_15px_rgba(197,241,53,0.3)] hover:shadow-[0_0_25px_rgba(197,241,53,0.5)]"
            >
              Register
            </button>
          </form>

          <div className="mt-6 text-center text-[#a0a0a0]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#c5f135] hover:underline">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;