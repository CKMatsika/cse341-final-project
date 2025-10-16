const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  penName: {
    type: String,
    trim: true,
    maxlength: [100, 'Pen name cannot exceed 100 characters']
  },
  bio: {
    type: String,
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  birthDate: {
    type: Date
  },
  deathDate: {
    type: Date
  },
  nationality: {
    type: String,
    trim: true,
    maxlength: [50, 'Nationality cannot exceed 50 characters']
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
  profileImage: {
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
  languages: [{
    type: String,
    enum: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Other']
  }],
  awards: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true,
      min: [1000, 'Award year must be after 1000'],
      max: [new Date().getFullYear(), 'Award year cannot be in the future']
    },
    description: {
      type: String,
      trim: true
    }
  }],
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
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Deceased', 'Retired'],
    default: 'Active'
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

// Virtual for full name
authorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
authorSchema.virtual('age').get(function() {
  if (!this.birthDate) return null;
  const now = new Date();
  const birth = new Date(this.birthDate);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }

  return age;
});

// Virtual for isAlive
authorSchema.virtual('isAlive').get(function() {
  return !this.deathDate || this.deathDate > new Date();
});

// Index for better search performance
authorSchema.index({ firstName: 'text', lastName: 'text', penName: 'text', bio: 'text' });
authorSchema.index({ genres: 1 });
authorSchema.index({ nationality: 1 });
authorSchema.index({ status: 1 });
authorSchema.index({ birthDate: -1 });

// Pre-save middleware to update books published count
authorSchema.pre('save', function(next) {
  // This would typically be updated when books are added/removed
  // For now, we'll leave it as a manual field
  next();
});

// Static method to get author statistics
authorSchema.statics.getAuthorStats = function(authorId) {
  return this.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(authorId) }
    },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: 'author',
        as: 'books'
      }
    },
    {
      $project: {
        fullName: { $concat: ['$firstName', ' ', '$lastName'] },
        booksCount: { $size: '$books' },
        averageRating: { $avg: '$books.averageRating' },
        genres: 1,
        nationality: 1
      }
    }
  ]);
};

module.exports = mongoose.model('Author', authorSchema);
