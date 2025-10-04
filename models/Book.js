const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Author is required']
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher'
  },
  publicationDate: {
    type: Date,
    required: [true, 'Publication date is required']
  },
  genre: [{
    type: String,
    enum: [
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
      'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
      'Drama', 'Thriller', 'Horror', 'Children', 'Young Adult',
      'Philosophy', 'Science', 'Technology', 'Other'
    ]
  }],
  language: {
    type: String,
    default: 'English',
    enum: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Other']
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  format: {
    type: String,
    enum: ['Hardcover', 'Paperback', 'E-book', 'Audiobook'],
    default: 'Paperback'
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  coverImage: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: [0, 'Rating count cannot be negative']
  },
  status: {
    type: String,
    enum: ['Published', 'Upcoming', 'Out of Print', 'Cancelled'],
    default: 'Published'
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

// Virtual for book age
bookSchema.virtual('age').get(function() {
  if (!this.publicationDate) return null;
  const now = new Date();
  const published = new Date(this.publicationDate);
  return now.getFullYear() - published.getFullYear();
});

// Index for better search performance
bookSchema.index({ title: 'text', description: 'text' });
bookSchema.index({ author: 1, publicationDate: -1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ averageRating: -1 });

// Pre-save middleware to update average rating
bookSchema.pre('save', function(next) {
  if (this.isModified('averageRating') || this.isModified('ratingCount')) {
    // Ensure averageRating is valid based on ratingCount
    if (this.ratingCount === 0) {
      this.averageRating = 0;
    }
  }
  next();
});

// Static method to calculate average rating from reviews
bookSchema.statics.calculateAverageRating = function(bookId) {
  return this.model('Review').aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]).then(result => {
    if (result.length > 0) {
      return this.findByIdAndUpdate(bookId, {
        averageRating: result[0].averageRating,
        ratingCount: result[0].ratingCount
      });
    }
  });
};

module.exports = mongoose.model('Book', bookSchema);
