// backend/src/routes/posts.routes.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getPosts,
  createPost,
  getPostById,
  updateInterest,
  assignWorker,
  removeInterestedUser,
  updateStatus, // ✅ Must be here
  getMyCreatedPosts,
  getMyInterestedPosts,
} from '../controllers/posts.controller.js';

const router = Router();

router.get('/', getPosts); // Public route to get all posts
router.post('/', authenticate, createPost); // Authenticated route to create a post
router.get('/:id', getPostById); // Public route to get a specific post
router.patch('/:id/interest', authenticate, updateInterest); // Authenticated route to show/hide interest (for current user)
router.patch('/:id/assign', authenticate, assignWorker); // Authenticated route to assign worker (creator only)
// NEW ROUTE: DELETE /posts/:id/interested/:userId (creator only)
router.delete('/:id/interested/:userId', authenticate, removeInterestedUser);
router.patch('/:id/status', authenticate, updateStatus); // ← new route
// NEW ROUTES FOR REQUESTS PAGE:
// GET /api/v1/posts/my/created - Get posts created by the authenticated user
router.get('/my/created', authenticate, getMyCreatedPosts);
// GET /api/v1/posts/my/interested - Get posts the authenticated user is interested in
router.get('/my/interested', authenticate, getMyInterestedPosts);

export default router;