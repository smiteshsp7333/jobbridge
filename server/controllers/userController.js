const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, bio, phone, address, skills, education, experience, projects, companyName, companyDescription } = req.body;
    const updateData = { name, bio, phone, address, skills, education, experience, projects, companyName, companyDescription };
    
    // Calculate profile completion logic (approximate)
    let completeness = 0;
    if (name) completeness += 14;
    if (bio) completeness += 14;
    if (phone) completeness += 14;
    if (skills && skills.length > 0) completeness += 14;
    if (education && education.length > 0) completeness += 14;
    if (experience && experience.length > 0) completeness += 14;
    if (req.user.resume) completeness += 16;
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { $set: { ...updateData, profileComplete: Math.min(completeness, 100) } }, 
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
