const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Publisher name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  foundedYear: {
    type: Number,
    min: [1400, 'Founded year must be after 1400'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  headquarters: {
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country name cannot exceed 50 characters']
    }
  },
  website: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  genres: [{
    type: String,
    enum: [
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
      'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
      'Drama', 'Thriller', 'Horror', 'Children', 'Young Adult',
      'Philosophy', 'Science', 'Technology', 'Academic', 'Other'
    ]
  }],
  imprint: [{
    name: {
      type: String,
      trim: true,
      required: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Acquired', 'Defunct'],
    default: 'Active'
  },
  socialMedia: {
    twitter: {
      type: String,
      trim: true,
      lowercase: true
    },
    facebook: {
      type: String,
      trim: true,
      lowercase: true
    },
    instagram: {
      type: String,
      trim: true,
      lowercase: true
    },
    linkedin: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  booksPublished: {
    type: Number,
    default: 0,
    min: [0, 'Books published count cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for publisher age
publisherSchema.virtual('age').get(function() {
  if (!this.foundedYear) return null;
  const currentYear = new Date().getFullYear();
  return currentYear - this.foundedYear;
});

// Index for better search performance
publisherSchema.index({ name: 'text', description: 'text' });
publisherSchema.index({ genres: 1 });
publisherSchema.index({ status: 1 });
publisherSchema.index({ foundedYear: -1 });

// Pre-save middleware to update books published count
publisherSchema.pre('save', function(next) {
  // This would typically be updated when books are added/removed
  // For now, we'll leave it as a manual field
  next();
});

// Static method to get publisher statistics
publisherSchema.statics.getPublisherStats = function(publisherId) {
  return this.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(publisherId) }
    },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: 'publisher',
        as: 'books'
      }
    },
    {
      $project: {
        name: 1,
        booksCount: { $size: '$books' },
        averageRating: { $avg: '$books.averageRating' },
        genres: 1
      }
    }
  ]);
};

module.exports = mongoose.model('Publisher', publisherSchema);
