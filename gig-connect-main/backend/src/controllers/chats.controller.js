// backend/src/controllers/chats.controller.js
import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';
import Post from '../models/Post.js';
import { z } from 'zod';
import mongoose from 'mongoose'; // Import mongoose for ObjectId handling

const sendMessageSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const getChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const chatRooms = await ChatRoom.find({ members: userId })
      .populate({
        path: 'post',
        populate: [
          { path: 'creator', select: 'name avatar rating completedJobs' },
          { path: 'interested', select: 'name avatar rating completedJobs' },
          { path: 'assigned', select: 'name avatar rating completedJobs' },
        ],
      })
      .populate('members', 'name avatar');

    res.json(chatRooms);
  } catch (err) {
    console.error('[GET CHATS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};


export const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Get user ID from auth middleware

    // Find the specific chat room where the user is a member
    const chatRoom = await ChatRoom.findById(id)
      .populate({
        path: 'post',
        populate: { path: 'creator', select: 'name avatar' },
      })
      .populate('members', 'name avatar')
      .populate({
        path: 'messages',
        populate: { path: 'sender', select: 'name avatar' },
      });

    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat not found' }); // Generalize error to avoid revealing if chat exists
    }

    // --- IMPROVED MEMBER CHECK ---
    console.log('[GET CHAT BY ID] Checking membership for userId:', userId, '(type:', typeof userId, ')');
    console.log('[GET CHAT BY ID] Chat room members:', chatRoom.members.map(m => ({ id: m._id.toString(), type: typeof m._id })));

    // Convert the incoming userId (from JWT, usually a string) to an ObjectId for comparison
    // This ensures the comparison is done correctly regardless of internal representation
    const userIdAsObjectId = new mongoose.Types.ObjectId(userId);

    const isMember = chatRoom.members.some(member => {
      // Convert the member._id (ObjectId) to string for comparison
      // Or convert userIdAsObjectId to string: userIdAsObjectId.toString() === member._id.toString()
      // Using member._id.equals is the most reliable way to compare ObjectId instances
      return member._id.equals(userIdAsObjectId);
    });

    console.log('[GET CHAT BY ID] Is member?', isMember);
    // --- END OF IMPROVEMENT ---

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied to this chat' });
    }

    res.json(chatRoom);
  } catch (err) {
    console.error('[GET CHAT BY ID ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = sendMessageSchema.parse(req.body);
    const userId = req.user.userId; // Get user ID from auth middleware

    // Find the chat room where the user is a member
    // Use mongoose.Types.ObjectId for the comparison here too
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const chatRoom = await ChatRoom.findOne({ _id: id, members: userObjectId });
    if (!chatRoom) {
      return res.status(403).json({ error: 'Access denied to this chat room' });
    }

    // Create the new message
    const message = new Message({
      content,
      sender: userObjectId, // Assign the sender ID as ObjectId
      chatRoom: id, // Assign the chat room ID
    });

    await message.save();

    // Populate the sender info for the response
    await message.populate('sender', 'name avatar');

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('[SEND MESSAGE ERROR]', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};