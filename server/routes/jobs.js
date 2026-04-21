const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

// io is attached to app by index.js
const getIo = (req) => req.app.get('io');

// GET /api/jobs (All active jobs for seeker dashboard)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Open' }).sort({ createdAt: -1 }).populate('employerId', 'name companyName profilePhoto');
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// POST /api/jobs (Create a job)
router.post('/', async (req, res) => {
  const { employerId, title, company, location, salary, type, description, requirements } = req.body;
  try {
    const newJob = new Job({ employerId, title, company, location, salary, type, description, requirements });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error });
  }
});

// GET /api/jobs/employer/:employerId (Employer dashboard data)
router.get('/employer/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;
    const jobs = await Job.find({ employerId }).sort({ createdAt: -1 });
    
    // Quick analytics
    const totalJobs = jobs.length;
    // Get all applications for these jobs
    const jobIds = jobs.map(j => j._id);
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('seekerId', 'name email profilePhoto resume resumes')
      .populate('jobId', 'title')
      .sort({ appliedAt: -1 });
      
    const totalApplications = applications.length;
    const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
    const acceptedCount = applications.filter(a => a.status === 'Accepted').length;

    res.status(200).json({
      jobs,
      applications,
      stats: {
        totalJobs,
        totalApplications,
        shortlistedCount,
        acceptedCount
      }
    });
  } catch (error) {
    console.error('Error fetching employer dashboard:', error);
    res.status(500).json({ message: 'Error fetching employer dashboard data' });
  }
});

// POST /api/jobs/apply (Apply and send email)
router.post('/apply', async (req, res) => {
  const { jobId, seekerId, employerId, userEmail, jobTitle, companyName } = req.body;

  if (!userEmail || (!jobTitle && !companyName)) {
    return res.status(400).json({ message: 'Missing required email or job fields' });
  }

  try {
    // If IDs are provided, log application to database
    if (jobId && seekerId && employerId) {
      const existingApplication = await Application.findOne({ jobId, seekerId });
      if (existingApplication) {
        return res.status(400).json({ message: 'You have already applied for this job.' });
      }
      
      const application = new Application({ jobId, seekerId, employerId, status: 'Under Review' });
      await application.save();
    }

    // Configure email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'test@gmail.com',
        pass: process.env.EMAIL_PASS || 'password',
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'no-reply@jobbridge.com',
      to: userEmail,
      subject: `Application Submitted: ${jobTitle} at ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #c5f135; background: #111; padding: 15px; text-align: center; border-radius: 8px;">JobBridge</h2>
          <p>Hi there,</p>
          <p>Your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted!</p>
          <p>The employer will review your profile and get back to you soon.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The JobBridge Team</strong></p>
        </div>
      `,
    };

    console.log(`Sending application confirmation email to ${userEmail} for ${jobTitle} at ${companyName}`);
    await transporter.sendMail(mailOptions);

    // Real-time: notify targeted employer of new application
    try {
      const io = getIo(req);
      if (io) io.to(`employer_${employerId}`).emit('new_application', { jobTitle, companyName, userEmail });
    } catch (_) {}

    res.status(200).json({ message: 'Application submitted and email sent successfully.' });
  } catch (error) {
    console.error('Apply/Email error:', error);
    // If duplicate error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied.' });
    }
    res.status(500).json({ message: 'Server error during application.' });
  }
});

// Update single application status
router.put('/applications/:appId/status', async (req, res) => {
  const { status } = req.body;
  try {
    const application = await Application.findByIdAndUpdate(req.params.appId, { status }, { new: true });
    // Real-time: broadcast status change
    try { const io = getIo(req); if (io) io.emit('status_changed', { appId: req.params.appId, status }); } catch (_) {}
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status' });
  }
});

// Clone a job (F5)
router.post('/:id/clone', async (req, res) => {
  try {
    const original = await Job.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Job not found' });
    const { _id, createdAt, __v, ...rest } = original.toObject();
    const asDraft = req.body.asDraft === true;
    const cloned = new Job({ ...rest, status: asDraft ? 'Draft' : 'Open', clonedFrom: original._id, createdAt: new Date() });
    await cloned.save();
    res.status(201).json(cloned);
  } catch (error) {
    res.status(500).json({ message: 'Error cloning job' });
  }
});

// Edit a job (F5)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job' });
  }
});

// Delete a job (F5)
router.delete('/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job' });
  }
});

// BULK: Update status for multiple applications
// PUT /api/jobs/applications/bulk-status
router.put('/applications/bulk-status', async (req, res) => {
  const { appIds, status } = req.body;
  if (!appIds || !Array.isArray(appIds) || !status) {
    return res.status(400).json({ message: 'appIds[] and status are required' });
  }
  try {
    const result = await Application.updateMany(
      { _id: { $in: appIds } },
      { $set: { status } }
    );
    res.status(200).json({ message: `Updated ${result.modifiedCount} application(s) to "${status}"`, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Bulk status error:', error);
    res.status(500).json({ message: 'Error updating statuses' });
  }
});

// BULK: Send emails to multiple applicants
// POST /api/jobs/applications/bulk-email
router.post('/applications/bulk-email', async (req, res) => {
  const { appIds, emailType, companyName, customMessage } = req.body;
  if (!appIds || !Array.isArray(appIds) || !emailType) {
    return res.status(400).json({ message: 'appIds[] and emailType are required' });
  }

  try {
    // Fetch applications with seeker + job info
    const applications = await Application.find({ _id: { $in: appIds } })
      .populate('seekerId', 'name email')
      .populate('jobId', 'title');

    const validApps = applications.filter(a => a.seekerId?.email);
    if (validApps.length === 0) {
      return res.status(400).json({ message: 'No valid applicant emails found.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'test@gmail.com',
        pass: process.env.EMAIL_PASS || 'password',
      },
    });

    const getEmailContent = (type, applicantName, jobTitle, company, extra) => {
      const templates = {
        interview: {
          subject: `Interview Invitation – ${jobTitle} at ${company}`,
          body: `<p>Dear <strong>${applicantName}</strong>,</p>
            <p>We are pleased to inform you that you have been shortlisted for the position of <strong>${jobTitle}</strong> at <strong>${company}</strong>.</p>
            <p>We would like to invite you for an interview. Our team will reach out shortly with the details.</p>
            ${extra ? `<p><em>${extra}</em></p>` : ''}
            <p>Best regards,<br/><strong>${company} Hiring Team</strong></p>`
        },
        shortlist: {
          subject: `You've Been Shortlisted – ${jobTitle} at ${company}`,
          body: `<p>Dear <strong>${applicantName}</strong>,</p>
            <p>Congratulations! Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been shortlisted.</p>
            <p>We were impressed with your profile and will be in touch with next steps soon.</p>
            ${extra ? `<p><em>${extra}</em></p>` : ''}
            <p>Best regards,<br/><strong>${company} Hiring Team</strong></p>`
        },
        rejection: {
          subject: `Application Update – ${jobTitle} at ${company}`,
          body: `<p>Dear <strong>${applicantName}</strong>,</p>
            <p>Thank you for your interest in the <strong>${jobTitle}</strong> role at <strong>${company}</strong>.</p>
            <p>After careful consideration, we have decided to move forward with other candidates at this time.</p>
            <p>We encourage you to apply for future openings and wish you the very best in your job search.</p>
            ${extra ? `<p><em>${extra}</em></p>` : ''}
            <p>Best regards,<br/><strong>${company} Hiring Team</strong></p>`
        },
        custom: {
          subject: `Message from ${company} regarding ${jobTitle}`,
          body: `<p>Dear <strong>${applicantName}</strong>,</p>
            <p>${extra || 'Please reach out to us for further details.'}</p>
            <p>Best regards,<br/><strong>${company} Hiring Team</strong></p>`
        }
      };
      return templates[type] || templates.custom;
    };

    const emailResults = await Promise.allSettled(
      validApps.map(app => {
        const { subject, body } = getEmailContent(
          emailType,
          app.seekerId.name,
          app.jobId?.title || 'the position',
          companyName || 'our company',
          customMessage
        );
        return transporter.sendMail({
          from: process.env.EMAIL_USER || 'no-reply@jobbridge.com',
          to: app.seekerId.email,
          subject,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px;">
              <div style="background:#111;padding:16px;border-radius:8px;text-align:center;margin-bottom:20px;">
                <span style="color:#c5f135;font-size:22px;font-weight:bold;">JobBridge</span>
              </div>
              ${body}
              <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
              <p style="color:#999;font-size:12px;text-align:center;">This email was sent via JobBridge · Do not reply</p>
            </div>`
        });
      })
    );

    const sent = emailResults.filter(r => r.status === 'fulfilled').length;
    const failed = emailResults.filter(r => r.status === 'rejected').length;

    res.status(200).json({ message: `Emails sent: ${sent}, failed: ${failed}`, sent, failed });
  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ message: 'Error sending bulk emails' });
  }
});

module.exports = router;
