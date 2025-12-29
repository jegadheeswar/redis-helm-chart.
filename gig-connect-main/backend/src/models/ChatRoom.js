// backend/src/models/ChatRoom.js
import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // ADMIN
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});


// Virtual for messages in this chat room
chatRoomSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chatRoom',
  options: { sort: { createdAt: 1 } }, // Sort messages by creation time
});

// Ensure virtual fields are serialized
chatRoomSchema.set('toJSON', { virtuals: true });
chatRoomSchema.set('toObject', { virtuals: true });

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

export default ChatRoom;