const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'employer'], required: true },
  profilePhoto: { type: String },
  bio: { type: String },
  phone: { type: String },
  address: { type: String },
  skills: [{ type: String }],
  education: [{
    institution: String, degree: String, field: String, startYear: String, endYear: String, grade: String
  }],
  experience: [{
    company: String, role: String, startDate: String, endDate: String, description: String
  }],
  projects: [{
    title: String, description: String, techStack: [String], link: String
  }],
  resume: { type: String },
  resumes: [{
    filename: String, path: String, createdAt: { type: Date, default: Date.now }, isActive: Boolean
  }],
  profileComplete: { type: Number, default: 0 },
  companyName: { type: String },
  companyDescription: { type: String },
  companyLogo: { type: String },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
