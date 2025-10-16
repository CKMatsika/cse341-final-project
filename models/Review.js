const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  // Reference to either Book or Author
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  // Reviewer information
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer is required']
  },
  // Review metadata
  helpful: {
    type: Number,
    default: 0,
    min: [0, 'Helpful count cannot be negative']
  },
  status: {
    type: String,
    enum: ['Published', 'Pending', 'Hidden', 'Flagged'],
    default: 'Published'
  },
  // Moderation fields
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Moderation reason cannot exceed 500 characters']
  },
  // Timestamps for creation and updates
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We're handling timestamps manually for more control
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for review age
reviewSchema.virtual('age').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

// Compound index to ensure one review per user per book/author
reviewSchema.index({ reviewer: 1, book: 1 }, { unique: true, partialFilterExpression: { book: { $exists: true } } });
reviewSchema.index({ reviewer: 1, author: 1 }, { unique: true, partialFilterExpression: { author: { $exists: true } } });

// Index for better search performance
reviewSchema.index({ book: 1, createdAt: -1 });
reviewSchema.index({ author: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ helpful: -1 });

// Pre-save middleware to update timestamps
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to calculate average rating for a book
reviewSchema.statics.calculateBookRating = function(bookId) {
  return this.aggregate([
    { $match: { book: mongoose.Types.ObjectId(bookId), status: 'Published' } },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]).then(result => {
    if (result.length > 0) {
      const Book = mongoose.model('Book');
      return Book.findByIdAndUpdate(bookId, {
        averageRating: result[0].averageRating,
        ratingCount: result[0].ratingCount
      });
    }
  });
};

// Static method to calculate average rating for an author
reviewSchema.statics.calculateAuthorRating = function(authorId) {
  return this.aggregate([
    { $match: { author: mongoose.Types.ObjectId(authorId), status: 'Published' } },
    {
      $group: {
        _id: '$author',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]).then(result => {
    if (result.length > 0) {
      const Author = mongoose.model('Author');
      return Author.findByIdAndUpdate(authorId, {
        averageRating: result[0].averageRating,
        ratingCount: result[0].ratingCount
      });
    }
  });
};

// Post-save middleware to update ratings
reviewSchema.post('save', async function(doc) {
  try {
    if (doc.book) {
      await doc.constructor.calculateBookRating(doc.book);
    }
    if (doc.author) {
      await doc.constructor.calculateAuthorRating(doc.author);
    }
  } catch (error) {
    console.error('Error updating ratings after review save:', error);
  }
});

// Post-remove middleware to update ratings
reviewSchema.post('remove', async function(doc) {
  try {
    if (doc.book) {
      await doc.constructor.calculateBookRating(doc.book);
    }
    if (doc.author) {
      await doc.constructor.calculateAuthorRating(doc.author);
    }
  } catch (error) {
    console.error('Error updating ratings after review removal:', error);
  }
});

// Static method to get review statistics
reviewSchema.statics.getReviewStats = function(targetId, targetType) {
  const matchStage = targetType === 'book'
    ? { book: mongoose.Types.ObjectId(targetId) }
    : { author: mongoose.Types.ObjectId(targetId) };

  return this.aggregate([
    { $match: { ...matchStage, status: 'Published' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $project: {
        averageRating: 1,
        totalReviews: 1,
        ratingDistribution: {
          1: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } },
          2: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
          3: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
          4: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
          5: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Review', reviewSchema);
