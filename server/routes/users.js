const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getMe, updateMe } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Application = require('../models/Application');

// ── Multer config for resume uploads ────────────────────────────────────────
const resumesDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(resumesDir)) fs.mkdirSync(resumesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resumesDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname.replace(/\s+/g, '_')}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and DOCX files are allowed'));
  },
});
// ────────────────────────────────────────────────────────────────────────────

router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateMe);

// POST /api/users/me/resume  – upload a new resume file
router.post('/me/resume', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileUrl = `/uploads/resumes/${req.file.filename}`;
    const newEntry = {
      filename: req.file.originalname,
      path: fileUrl,
      createdAt: new Date(),
      isActive: false,
    };

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If this is the first resume, make it primary automatically
    const isFirst = !user.resumes || user.resumes.length === 0;
    if (isFirst) {
      newEntry.isActive = true;
      user.resume = fileUrl;
    }

    user.resumes.push(newEntry);
    await user.save();

    res.status(201).json({ message: 'Resume uploaded successfully', user });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ message: err.message || 'Error uploading resume' });
  }
});

// PUT /api/users/me/resume/:resumeId/primary – set a resume as primary
router.put('/me/resume/:resumeId/primary', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let primaryPath = '';
    user.resumes = user.resumes.map((r) => {
      const active = r._id.toString() === req.params.resumeId;
      if (active) primaryPath = r.path;
      return { ...r.toObject(), isActive: active };
    });

    user.resume = primaryPath;
    await user.save();

    res.json({ message: 'Primary resume updated', user });
  } catch (err) {
    console.error('Set primary error:', err);
    res.status(500).json({ message: 'Error updating primary resume' });
  }
});

// DELETE /api/users/me/resume/:resumeId – delete a specific resume
router.delete('/me/resume/:resumeId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const target = user.resumes.id(req.params.resumeId);
    if (!target) return res.status(404).json({ message: 'Resume not found' });

    // Delete physical file
    const filePath = path.join(__dirname, '..', target.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // If deleted resume was primary, clear it
    if (user.resume === target.path) user.resume = '';

    user.resumes = user.resumes.filter(
      (r) => r._id.toString() !== req.params.resumeId
    );

    // Auto-promote first remaining resume to primary if none active
    const hasActive = user.resumes.some((r) => r.isActive);
    if (!hasActive && user.resumes.length > 0) {
      user.resumes[0].isActive = true;
      user.resume = user.resumes[0].path;
    }

    await user.save();
    res.json({ message: 'Resume deleted', user });
  } catch (err) {
    console.error('Delete resume error:', err);
    res.status(500).json({ message: 'Error deleting resume' });
  }
});

// Get applications for a seeker
router.get('/:id/applications', async (req, res) => {
  try {
    const applications = await Application.find({ seekerId: req.params.id }).populate('jobId');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Set up multer for logo uploads
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/logos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const logoUpload = multer({ storage: logoStorage, limits: { fileSize: 2 * 1024 * 1024 } });

// POST /api/users/me/logo (Upload company logo)
router.post('/me/logo', verifyToken, logoUpload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.companyLogo = `/uploads/logos/${req.file.filename}`;
    await user.save();
    res.json({ message: 'Logo uploaded successfully', user });
  } catch (err) {
    console.error('Logo upload error:', err);
    res.status(500).json({ message: 'Error uploading logo' });
  }
});

module.exports = router;
