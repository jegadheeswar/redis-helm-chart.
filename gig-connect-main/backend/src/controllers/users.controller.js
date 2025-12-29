import User from '../models/User.js';

export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId; // Get user ID from auth middleware

    const user = await User.findById(userId).select('-password'); // Exclude password from response

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      rating: {
        avg: user.ratingAvg,
        count: user.ratingCount,
      },
      completedJobs: user.completedJobs,
      createdAt: user.createdAt,
      role: user.role,
    });
  } catch (err) {
    console.error('[GET ME ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};
// --- NEW: Update Profile (name, avatar) ---
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, avatar } = req.body;

    // Validate
    if (name && (name.length < 2 || name.length > 50)) {
      return res.status(400).json({ error: 'Name must be 2–50 characters' });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      rating: {
        avg: user.rating.avg,
        count: user.rating.count,
      },
      completedJobs: user.completedJobs,
      createdAt: user.createdAt,
      role: user.role,
    });
  } catch (err) {
    console.error('[UPDATE PROFILE ERROR]', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed', details: err.message });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { avatar: avatarPath },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    console.error('[UPDATE AVATAR ERROR]', err);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};
