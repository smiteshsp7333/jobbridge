import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { email, password });
      login(res.data.token);
      navigate(res.data.user.role === 'seeker' ? '/seeker/dashboard' : '/employer/dashboard');
    } catch (err: any) {
      console.error(err);
      // In production you would show a toast or text error here
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-white font-sans">
      {/* Left Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-[#0f0f0f] relative overflow-hidden text-center items-center justify-center"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #0f0f0f 70%)'
        }}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="z-10 flex flex-col items-center justify-center h-full space-y-6">
          <h1 className="text-6xl font-bold tracking-tighter">
            Job<span className="text-[#c5f135]">Bridge</span>
          </h1>
          <p className="text-2xl text-[#a0a0a0] font-light">
            Bridging Job Seekers & Employers
          </p>
        </div>
        <div className="z-10 text-[#a0a0a0] mt-auto">
          Trusted by students and employers worldwide.
        </div>
      </motion.div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md bg-[#1a1a1a] p-10 rounded-2xl border border-[#2a2a2a] shadow-2xl"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Sign In</h2>
            <p className="text-[#a0a0a0]">Welcome back to JobBridge</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] focus:ring-1 focus:ring-[#c5f135] transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5f135] focus:ring-1 focus:ring-[#c5f135] transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-[#c5f135] transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <a href="#" className="text-sm text-[#a0a0a0] hover:text-[#c5f135] transition-colors">
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#c5f135] text-black font-semibold rounded-lg px-4 py-3 hover:bg-[#b0d92e] transition-colors mt-4 shadow-[0_0_15px_rgba(197,241,53,0.3)] hover:shadow-[0_0_25px_rgba(197,241,53,0.5)]"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center text-[#a0a0a0]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#c5f135] hover:underline">
              Register here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
