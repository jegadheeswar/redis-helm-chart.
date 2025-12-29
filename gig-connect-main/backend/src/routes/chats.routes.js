// backend/src/routes/chats.routes.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getChats, getChatById, sendMessage } from '../controllers/chats.controller.js';

const router = Router();

router.get('/', authenticate, getChats); // Get user's chat rooms
router.get('/:id', authenticate, getChatById); // Get specific chat room details
router.post('/:id/messages', authenticate, sendMessage); // Send a message to a chat room

export default router;