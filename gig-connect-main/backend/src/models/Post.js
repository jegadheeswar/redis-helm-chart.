// backend/src/models/Post.js
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
  },
  location: {
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true, trim: true },
    },
    required: true,
  },
  requiredCount: {
    type: Number,
    required: true,
    min: 1,
  },
  perPersonRate: {
    type: Number,
    required: true,
    min: 1,
  },
  date: {
    type: String, // "YYYY-MM-DD"
    required: true,
  },
  time: {
    type: String, // "HH:mm"
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  images: [{
    type: String, // Array of image URLs
  }],
  status: {
    type: String,
    enum: ['OPEN', 'FILLED', 'COMPLETED', 'CANCELLED'],
    default: 'OPEN',
  },
  distance: {
    type: Number, // Optional: calculated distance for UI
    default: null,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  interested: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  assigned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Virtual for the associated chat room (if any)
postSchema.virtual('chatRoom', {
  ref: 'ChatRoom',
  localField: '_id',
  foreignField: 'post',
  options: { limit: 1 }, // One post has one chat room
});

// Ensure virtual fields are serialized
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model('Post', postSchema);

export default Post;