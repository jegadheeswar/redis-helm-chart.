// backend/src/controllers/posts.controller.js
// ... (other imports)
import Post from '../models/Post.js';
import User from '../models/User.js';
import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';
import { z } from 'zod';
import mongoose from 'mongoose';

const createPostSchema = z.object({
  title: z.string().min(3),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }),
  requiredCount: z.number().int().min(1),
  perPersonRate: z.number().int().min(1),
  date: z.string(), // YYYY-MM-DD
  time: z.string(), // HH:mm
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
});

// --- Define functions WITHOUT 'export const' ---
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('creator', 'name avatar ratingAvg ratingCount completedJobs')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error('[GET POSTS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

const createPost = async (req, res) => {
  try {
    console.log('[CREATE POST] Request received:', req.method, req.url);
    console.log('[CREATE POST] Request Body:', req.body);
    console.log('[CREATE POST] Authenticated User (req.user):', req.user);

    const parsed = createPostSchema.parse(req.body);
    const userId = req.user.userId; // Get user ID from auth middleware

    if (!userId) {
      console.error('[CREATE POST ERROR] No userId found in req.user:', req.user);
      return res.status(401).json({ error: 'Unauthorized: User information missing' });
    }

    console.log('[CREATE POST] Looking for creator with ID:', userId);

    const creator = await User.findById(userId);
    if (!creator) {
      console.error('[CREATE POST ERROR] Creator not found with ID:', userId);
      return res.status(404).json({ error: 'Creator not found' });
    }

    console.log('[CREATE POST] Creator found in DB:', creator._id.toString());

    const post = new Post({
      title: parsed.title,
      location: parsed.location,
      requiredCount: parsed.requiredCount,
      perPersonRate: parsed.perPersonRate,
      date: parsed.date,
      time: parsed.time,
      description: parsed.description || '',
      images: parsed.images || [],
      status: 'OPEN',
      creator: creator._id, // Assign the Mongoose ObjectId
    });

    console.log('[CREATE POST] Post object created in memory:', post.toObject());

    await post.save();

    console.log('[CREATE POST] Post saved successfully to DB:', post._id.toString());

    // Create chat room immediately after post creation
    const chatRoom = new ChatRoom({
      post: post._id, // Link to the newly created post
      members: [creator._id], // Add the creator as the initial member
    });

    await chatRoom.save();
    console.log('[CREATE POST] Chat room created and linked to post:', chatRoom._id.toString());

    await post.populate('creator', 'name avatar ratingAvg ratingCount completedJobs');

    console.log('[CREATE POST] Post populated, sending response.');
    res.status(201).json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[CREATE POST ZOD VALIDATION ERROR]', error.errors);
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }

    console.error('[CREATE POST SERVER ERROR (Generic)]', error);
    console.error('[CREATE POST ERROR STACK]', error.stack);
    res.status(500).json({ error: 'Failed to create post', details: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

   let post = await Post.findById(id)
  .populate('creator', 'name avatar rating.completedJobs') // <-- Corrected
  .populate('interested', 'name avatar rating.completedJobs') // <-- Corrected
  .populate('assigned', 'name avatar rating.completedJobs'); // <-- Corrected

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Fetch associated chat room IF IT EXISTS
    let chatRoom = await ChatRoom.findOne({ post: post._id })
      .populate('members', 'name avatar');

    if (chatRoom) {
      const messages = await Message.find({ chatRoom: chatRoom._id })
        .populate('sender', 'name avatar')
        .sort({ createdAt: 1 });

      chatRoom = {
        ...chatRoom.toObject(),
        messages: messages,
      };
    }

    post = {
      ...post.toObject(),
      chatRoom: chatRoom,
    };

    res.json(post);
  } catch (err) {
    console.error('[GET POST BY ID ERROR (Fixed)]', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

const updateInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Get user ID from auth middleware

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isInterested = post.interested.some(interestedId => interestedId.equals(userObjectId));

    if (isInterested) {
      post.interested.pull(userObjectId);
    } else {
      post.interested.push(userObjectId);
    }

    await post.save();

    await post.populate('creator', 'name avatar ratingAvg ratingCount completedJobs');
    await post.populate('interested', 'name avatar ratingAvg ratingCount completedJobs');
    await post.populate('assigned', 'name avatar ratingAvg ratingCount completedJobs');

    res.json(post);
  } catch (err) {
    console.error('[UPDATE INTEREST ERROR]', err);
    res.status(500).json({ error: 'Failed to update interest' });
  }
};

// NEW CONTROLLER FUNCTION: Remove a specific user from the interested list (Creator only)
const removeInterestedUser = async (req, res) => {
  try {
    const { id: postId, userId: interestedUserId } = req.params; // Get post ID and interested user ID from URL params
    const currentUserId = req.user.userId; // Get the ID of the requesting user (creator)

    // Find the post and populate the creator to check permissions
    const post = await Post.findById(postId).populate('creator', '_id');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the requesting user is the creator (NO ROLE CHECK HERE)
    if (!post.creator._id.equals(new mongoose.Types.ObjectId(currentUserId))) {
      return res.status(403).json({ error: 'Only the creator can remove interested users' });
    }

    // Validate the interestedUserId parameter
    if (!mongoose.Types.ObjectId.isValid(interestedUserId)) {
        return res.status(400).json({ error: 'Invalid interested user ID' });
    }

    const interestedUserObjectId = new mongoose.Types.ObjectId(interestedUserId);

    // Check if the user is actually in the interested list
    if (!post.interested.includes(interestedUserObjectId)) {
        return res.status(400).json({ error: 'User is not interested in this post' });
    }

    // Remove the user from the interested list
    post.interested.pull(interestedUserObjectId);

    await post.save();

    // Populate for the response
    await post.populate('creator', 'name avatar ratingAvg ratingCount completedJobs');
    await post.populate('interested', 'name avatar ratingAvg ratingCount completedJobs');
    await post.populate('assigned', 'name avatar ratingAvg ratingCount completedJobs');

    res.json(post);
  } catch (err) {
    console.error('[REMOVE INTERESTED USER ERROR]', err);
    res.status(500).json({ error: 'Failed to remove interested user' });
  }
};

// backend/src/controllers/posts.controller.js
// ... (other imports)

const assignWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body; // ID of the worker to assign
    const userId = req.user.userId; // ID of the user making the request

    if (!workerId) {
      return res.status(400).json({ error: 'workerId is required' });
    }

    // Find the post
    const post = await Post.findById(id).populate('creator', '_id');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the requesting user is the creator
    if (!post.creator._id.equals(new mongoose.Types.ObjectId(userId))) {
      return res.status(403).json({ error: 'Only the creator can assign workers' });
    }

    // Find the worker user
    const worker = await User.findById(workerId);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Add worker to assigned list if not already there
    if (!post.assigned.includes(worker._id)) {
      post.assigned.push(worker._id);
    }

    // Remove worker from interested list if they were interested
    post.interested.pull(worker._id);

    // Update status if required count is met
    if (post.assigned.length >= post.requiredCount) {
      post.status = 'FILLED';
    }

    await post.save();

    // Populate for the response
    await post.populate('creator', 'name avatar ratingAvg ratingCount completedJobs');
    await post.populate('interested', 'name avatar ratingAvg ratingCount completedJobs');
    await post.populate('assigned', 'name avatar ratingAvg ratingCount completedJobs');

    // --- CRITICAL CHANGE: ADD ACCEPTED WORKER TO CHAT ROOM ---
    // Find the associated chat room for this post
    let chatRoom = await ChatRoom.findOne({ post: post._id });
    if (chatRoom) {
      // Add the assigned worker to the chat room members if not already present
      if (!chatRoom.members.includes(worker._id)) {
        chatRoom.members.push(worker._id);
        await chatRoom.save(); // Save the updated chat room
        console.log(`[ASSIGN WORKER] Added worker ${worker._id} to chat room ${chatRoom._id} for post ${post._id}`);
      } else {
        console.log(`[ASSIGN WORKER] Worker ${worker._id} was already in chat room ${chatRoom._id}`);
      }
    } else {
      console.warn(`[ASSIGN WORKER] No chat room found for post ${post._id} during assignment. This should not happen if chat room is created on post creation.`);
      // Potentially create the chat room here if it was missed, though createPost should handle it.
      // const newChatRoom = new ChatRoom({ post: post._id, members: [post.creator._id, worker._id] });
      // await newChatRoom.save();
    }
    // --- END OF CHANGE ---

    res.json(post);
  } catch (err) {
    console.error('[ASSIGN WORKER ERROR]', err);
    res.status(500).json({ error: 'Failed to assign worker' });
  }
};

// --- NEW CONTROLLER FUNCTIONS FOR REQUESTS PAGE (Also WITHOUT 'export const') ---

// NEW CONTROLLER FUNCTION: Get posts created by the authenticated user
const getMyCreatedPosts = async (req, res) => {
  try {
    const userId = req.user.userId; // Get user ID from auth middleware

    // Find posts where the creator is the authenticated user (NO ROLE CHECK HERE)
    const posts = await Post.find({ creator: userId })
      .populate('creator', 'name avatar ratingAvg ratingCount completedJobs') // Populate creator details
      .populate('interested', 'name avatar ratingAvg ratingCount completedJobs') // Populate interested users
      .populate('assigned', 'name avatar ratingAvg ratingCount completedJobs') // Populate assigned users
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(posts);
  } catch (err) {
    console.error('[GET MY CREATED POSTS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch created posts' });
  }
};

// NEW CONTROLLER FUNCTION: Get posts the authenticated user is interested in
const getMyInterestedPosts = async (req, res) => {
  try {
    const userId = req.user.userId; // Get user ID from auth middleware

    // Find posts where the authenticated user is in the 'interested' list (NO ROLE CHECK HERE)
    const posts = await Post.find({
      interested: userId,
      // Optional: Exclude posts created by the user themselves
      // creator: { $ne: userId }
    })
      .populate('creator', 'name avatar ratingAvg ratingCount completedJobs') // Populate creator details
      .populate('interested', 'name avatar ratingAvg ratingCount completedJobs') // Populate interested users
      .populate('assigned', 'name avatar ratingAvg ratingCount completedJobs') // Populate assigned users
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(posts);
  } catch (err) {
    console.error('[GET MY INTERESTED POSTS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch interested posts' });
  }
};

// NEW: Update Post Status (creator only)
 const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const allowedStatuses = ['OPEN', 'FILLED', 'COMPLETED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const post = await Post.findById(id).populate('creator', '_id');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only creator can change status
    if (!post.creator._id.equals(new mongoose.Types.ObjectId(userId))) {
      return res.status(403).json({ error: 'Only the creator can update status' });
    }

    // Prevent reverting from COMPLETED/CANCELLED
    if (['COMPLETED', 'CANCELLED'].includes(post.status) && !['COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Cannot revert from completed/cancelled status' });
    }

    post.status = status;
    await post.save();

    // Populate for response
    await post.populate('creator', 'name avatar rating completedJobs');
    await post.populate('interested', 'name avatar rating completedJobs');
    await post.populate('assigned', 'name avatar rating completedJobs');

    res.json(post);
  } catch (err) {
    console.error('[UPDATE STATUS ERROR]', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// Then add to exports:
export {
  // ... existing exports ...
  updateStatus, // ← add this
};

// --- Single Export Statement (Export ALL functions here) ---
export {
  getPosts,
  createPost,
  getPostById,
  updateInterest,
  assignWorker,
  removeInterestedUser,
  // Add the new functions here
  getMyCreatedPosts,
  getMyInterestedPosts,
};
// --- End of Exports ---