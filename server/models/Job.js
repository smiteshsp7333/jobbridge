const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String },
  type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'], default: 'Full-time' },
  status: { type: String, enum: ['Open', 'Closed', 'Draft'], default: 'Open' },
  clonedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
