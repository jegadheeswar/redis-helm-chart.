import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';
import { getMe, updateProfile } from '../controllers/users.controller.js';

const router = Router();

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateProfile);

// 🔥 NEW: Avatar upload
router.patch(
  '/me/avatar',
  authenticate,
  uploadAvatar.single('avatar'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    req.user.avatar = `/uploads/avatars/${req.file.filename}`;
    await req.user.save();

    res.json(req.user);
  }
);

export default router;
