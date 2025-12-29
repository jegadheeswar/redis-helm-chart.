// backend/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // Ensure bcrypt is imported

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  avatar: {
    type: String, // URL to avatar image
    default: null,
  },
  rating: {
  avg: { type: Number, default: 0.0, min: 0, max: 5 },
  count: { type: Number, default: 0 },
},
  completedJobs: {
    type: Number,
    default: 0,
  },
  // Add password field
  password: {
    type: String,
    required: true, // Make it required for password-based auth
  },
  
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    return next(); // Call next if password wasn't modified
  }

  try {
    // Hash the password with bcrypt (12 rounds is a good default)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    // Do NOT call next() here when using async/await in pre hooks.
    // Mongoose handles it automatically upon successful completion of the async function.
  } catch (error) {
    // Pass error to mongoose using next()
    next(error);
  }
});

// Method to compare password (useful for login)
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Use the instance's password field directly
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for posts created by this user
userSchema.virtual('createdPosts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'creator',
});

// Virtual for posts this user is interested in
userSchema.virtual('interestedPosts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'interested',
});

// Virtual for posts this user is assigned to
userSchema.virtual('assignedPosts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'assigned',
});

// Virtual for chat rooms this user is a member of
userSchema.virtual('chatRooms', {
  ref: 'ChatRoom',
  localField: '_id',
  foreignField: 'members',
});

// Virtual for messages sent by this user
userSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'sender',
});

// Ensure virtual fields are serialized (important for JSON responses)
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;