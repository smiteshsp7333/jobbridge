const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobbridge';

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Clear old demo data
  await User.deleteMany({ email: /demo@/ });
  await Job.deleteMany({ company: /DemoCorp/ });
  await Application.deleteMany({});

  // Create employer
  const employer = await User.create({
    name: 'Demo Employer',
    email: 'employer.demo@jobbridge.com',
    password: '$2a$10$7Qw1Qw1Qw1Qw1Qw1Qw1QwOQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', // bcrypt hash for 'password123'
    role: 'employer',
    companyName: 'DemoCorp',
    companyDescription: 'A leading demo company.'
  });

  // Create seeker
  const seeker = await User.create({
    name: 'Demo Seeker',
    email: 'seeker.demo@jobbridge.com',
    password: '$2a$10$7Qw1Qw1Qw1Qw1Qw1Qw1QwOQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', // bcrypt hash for 'password123'
    role: 'seeker',
  });

  // Create jobs
  const job1 = await Job.create({
    employerId: employer._id,
    title: 'Frontend Developer',
    company: 'DemoCorp',
    location: 'Remote',
    salary: '₹12,00,000',
    type: 'Full-time',
    description: 'Build beautiful UIs with React.',
    requirements: ['React', 'TypeScript', 'Tailwind CSS']
  });
  const job2 = await Job.create({
    employerId: employer._id,
    title: 'Backend Developer',
    company: 'DemoCorp',
    location: 'Bangalore',
    salary: '₹15,00,000',
    type: 'Full-time',
    description: 'Design robust APIs with Node.js.',
    requirements: ['Node.js', 'MongoDB', 'Express']
  });

  // Create application
  await Application.create({
    jobId: job1._id,
    seekerId: seeker._id,
    employerId: employer._id,
    status: 'Under Review'
  });

  console.log('Demo data seeded!');
  process.exit();
}

seed();
