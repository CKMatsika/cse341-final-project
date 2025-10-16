const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  picture: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['reader', 'author', 'admin'],
    default: 'reader'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'it', 'pt'],
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      }
    }
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  readingHistory: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    status: {
      type: String,
      enum: ['want_to_read', 'currently_reading', 'read'],
      default: 'want_to_read'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    startedAt: {
      type: Date
    },
    finishedAt: {
      type: Date
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better search performance
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find or create user
userSchema.statics.findOrCreate = async function(profile) {
  try {
    let user = await this.findOne({ googleId: profile.id });

    if (user) {
      // Update user information
      user.name = profile.displayName;
      user.picture = profile.photos[0].value;
      user.lastLogin = new Date();
      await user.save();
      return user;
    }

    // Create new user
    user = await this.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      picture: profile.photos[0].value,
      lastLogin: new Date()
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Static method to get user statistics
userSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(userId) }
    },
    {
      $project: {
        name: 1,
        role: 1,
        favoritesCount: { $size: '$favorites' },
        readingHistoryCount: { $size: '$readingHistory' },
        booksRead: {
          $size: {
            $filter: {
              input: '$readingHistory',
              cond: { $eq: ['$$this.status', 'read'] }
            }
          }
        },
        currentlyReading: {
          $size: {
            $filter: {
              input: '$readingHistory',
              cond: { $eq: ['$$this.status', 'currently_reading'] }
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);
