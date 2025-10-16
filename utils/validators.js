const Joi = require('joi');

// Book validation schemas
const bookValidation = {
  create: Joi.object({
    title: Joi.string().trim().max(200).required().messages({
      'string.empty': 'Book title is required',
      'string.max': 'Title cannot exceed 200 characters'
    }),
    isbn: Joi.string().trim().uppercase().optional().allow(''),
    description: Joi.string().max(2000).optional().allow('').messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
    author: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Author must be a valid ObjectId'
    }),
    publisher: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().allow('').messages({
      'string.pattern.base': 'Publisher must be a valid ObjectId'
    }),
    publicationDate: Joi.date().required().messages({
      'date.base': 'Publication date must be a valid date'
    }),
    genre: Joi.array().items(
      Joi.string().valid(
        'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
        'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
        'Drama', 'Thriller', 'Horror', 'Children', 'Young Adult',
        'Philosophy', 'Science', 'Technology', 'Other'
      )
    ).optional(),
    language: Joi.string().valid('English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Other').optional(),
    pages: Joi.number().integer().min(1).optional().messages({
      'number.min': 'Pages must be at least 1'
    }),
    format: Joi.string().valid('Hardcover', 'Paperback', 'E-book', 'Audiobook').optional(),
    price: Joi.number().min(0).optional().messages({
      'number.min': 'Price cannot be negative'
    }),
    coverImage: Joi.string().trim().uri().optional().allow('').messages({
      'string.uri': 'Cover image must be a valid URL'
    }),
    tags: Joi.array().items(Joi.string().trim()).optional()
  }),

  update: Joi.object({
    title: Joi.string().trim().max(200).optional().messages({
      'string.max': 'Title cannot exceed 200 characters'
    }),
    isbn: Joi.string().trim().uppercase().optional().allow(''),
    description: Joi.string().max(2000).optional().allow('').messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
    author: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
      'string.pattern.base': 'Author must be a valid ObjectId'
    }),
    publisher: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().allow('').messages({
      'string.pattern.base': 'Publisher must be a valid ObjectId'
    }),
    publicationDate: Joi.date().optional(),
    genre: Joi.array().items(
      Joi.string().valid(
        'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
        'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
        'Drama', 'Thriller', 'Horror', 'Children', 'Young Adult',
        'Philosophy', 'Science', 'Technology', 'Other'
      )
    ).optional(),
    language: Joi.string().valid('English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Other').optional(),
    pages: Joi.number().integer().min(1).optional().messages({
      'number.min': 'Pages must be at least 1'
    }),
    format: Joi.string().valid('Hardcover', 'Paperback', 'E-book', 'Audiobook').optional(),
    price: Joi.number().min(0).optional().messages({
      'number.min': 'Price cannot be negative'
    }),
    coverImage: Joi.string().trim().uri().optional().allow('').messages({
      'string.uri': 'Cover image must be a valid URL'
    }),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    status: Joi.string().valid('Published', 'Upcoming', 'Out of Print', 'Cancelled').optional()
  })
};

// Publisher validation schemas
const publisherValidation = {
  create: Joi.object({
    name: Joi.string().trim().max(100).required().messages({
      'string.empty': 'Publisher name is required',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    description: Joi.string().max(1000).optional().allow('').messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    foundedYear: Joi.number().integer().min(1400).max(new Date().getFullYear()).optional().messages({
      'number.min': 'Founded year must be after 1400',
      'number.max': 'Founded year cannot be in the future'
    }),
    headquarters: Joi.object({
      city: Joi.string().trim().max(50).optional().messages({
        'string.max': 'City name cannot exceed 50 characters'
      }),
      country: Joi.string().trim().max(50).optional().messages({
        'string.max': 'Country name cannot exceed 50 characters'
      })
    }).optional(),
    website: Joi.string().trim().uri().optional().allow('').messages({
      'string.uri': 'Website must be a valid URL'
    }),
    email: Joi.string().trim().email().optional().allow('').messages({
      'string.email': 'Please provide a valid email address'
    }),
    phone: Joi.string().trim().optional(),
    logo: Joi.string().trim().uri().optional().allow('').messages({
      'string.uri': 'Logo must be a valid URL'
    }),
    genres: Joi.array().items(
      Joi.string().valid(
        'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
        'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
        'Drama', 'Thriller', 'Horror', 'Children', 'Young Adult',
        'Philosophy', 'Science', 'Technology', 'Academic', 'Other'
      )
    ).optional(),
    imprint: Joi.array().items(
      Joi.object({
        name: Joi.string().trim().required(),
        description: Joi.string().trim().optional()
      })
    ).optional(),
    socialMedia: Joi.object({
      twitter: Joi.string().trim().optional(),
      facebook: Joi.string().trim().optional(),
      instagram: Joi.string().trim().optional(),
      linkedin: Joi.string().trim().optional()
    }).optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Acquired', 'Defunct').optional()
  }),

  update: Joi.object({
    name: Joi.string().trim().max(100).optional().messages({
      'string.max': 'Name cannot exceed 100 characters'
    }),
    description: Joi.string().max(1000).optional().allow('').messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    foundedYear: Joi.number().integer().min(1400).max(new Date().getFullYear()).optional().messages({
      'number.min': 'Founded year must be after 1400',
      'number.max': 'Founded year cannot be in the future'
    }),
    headquarters: Joi.object({
      city: Joi.string().trim().max(50).optional().messages({
        'string.max': 'City name cannot exceed 50 characters'
      }),
      country: Joi.string().trim().max(50).optional().messages({
        'string.max': 'Country name cannot exceed 50 characters'
      })
    }).optional(),
    website: Joi.string().trim().uri().optional().allow('').messages({
      'string.uri': 'Website must be a valid URL'
    }),
    email: Joi.string().trim().email().optional().allow('').messages({
      'string.email': 'Please provide a valid email address'
    }),
    phone: Joi.string().trim().optional(),
    logo: Joi.string().trim().uri().optional().allow('').messages({
      'string.uri': 'Logo must be a valid URL'
    }),
    genres: Joi.array().items(
      Joi.string().valid(
        'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
        'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
        'Drama', 'Thriller', 'Horror', 'Children', 'Young Adult',
        'Philosophy', 'Science', 'Technology', 'Academic', 'Other'
      )
    ).optional(),
    imprint: Joi.array().items(
      Joi.object({
        name: Joi.string().trim().required(),
        description: Joi.string().trim().optional()
      })
    ).optional(),
    socialMedia: Joi.object({
      twitter: Joi.string().trim().optional(),
      facebook: Joi.string().trim().optional(),
      instagram: Joi.string().trim().optional(),
      linkedin: Joi.string().trim().optional()
    }).optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Acquired', 'Defunct').optional()
  })
};

// Query validation schemas
const queryValidation = {
  books: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    search: Joi.string().trim().optional(),
    author: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    publisher: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    genre: Joi.string().valid(
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
      'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
      'Drama', 'Thriller', 'Horror', 'Children', 'Young Adult',
      'Philosophy', 'Science', 'Technology', 'Other'
    ).optional(),
    sortBy: Joi.string().valid('title', 'publicationDate', 'averageRating', 'createdAt').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional()
  }),

  authors: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    search: Joi.string().trim().optional(),
    genre: Joi.string().valid(
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
      'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
      'Drama', 'Thriller', 'Horror', 'Children', 'Young Adult',
      'Philosophy', 'Science', 'Technology', 'Academic', 'Other'
    ).optional(),
    nationality: Joi.string().trim().optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Deceased', 'Retired').optional(),
    sortBy: Joi.string().valid('firstName', 'lastName', 'birthDate', 'createdAt').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional()
  }),

  reviews: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    search: Joi.string().trim().optional(),
    book: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    author: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    reviewer: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    rating: Joi.number().integer().min(1).max(5).optional(),
    status: Joi.string().valid('Published', 'Pending', 'Hidden', 'Flagged').optional(),
    sortBy: Joi.string().valid('title', 'rating', 'helpful', 'createdAt').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional()
  })
};

// Author validation schemas
const authorValidation = {
  create: Joi.object({
    firstName: Joi.string().trim().max(50).required().messages({
      'string.empty': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters'
    }),
    lastName: Joi.string().trim().max(50).required().messages({
      'string.empty': 'Last name is required',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
    penName: Joi.string().trim().max(100).optional().messages({
      'string.max': 'Pen name cannot exceed 100 characters'
    }),
    bio: Joi.string().max(2000).optional().allow('').messages({
      'string.max': 'Bio cannot exceed 2000 characters'
    }),
    birthDate: Joi.date().optional(),
    deathDate: Joi.date().optional().when('birthDate', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('birthDate')).messages({
        'date.greater': 'Death date must be after birth date'
      })
    }),
    nationality: Joi.string().trim().max(50).optional().messages({
      'string.max': 'Nationality cannot exceed 50 characters'
    }),
    website: Joi.string().trim().uri().optional().allow('').messages({
      'string.uri': 'Website must be a valid URL'
    }),
    email: Joi.string().trim().email().optional().allow('').messages({
      'string.email': 'Please provide a valid email address'
    }),
    phone: Joi.string().trim().optional(),
    profileImage: Joi.string().trim().uri().optional().allow('').messages({
      'string.uri': 'Profile image must be a valid URL'
    }),
    genres: Joi.array().items(
      Joi.string().valid(
        'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
        'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
        'Drama', 'Thriller', 'Horror', 'Children', 'Young Adult',
        'Philosophy', 'Science', 'Technology', 'Academic', 'Other'
      )
    ).optional(),
    languages: Joi.array().items(
      Joi.string().valid('English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Other')
    ).optional(),
    awards: Joi.array().items(
      Joi.object({
        name: Joi.string().trim().required(),
        year: Joi.number().integer().min(1000).max(new Date().getFullYear()).required().messages({
          'number.min': 'Award year must be after 1000',
          'number.max': 'Award year cannot be in the future'
        }),
        description: Joi.string().trim().optional()
      })
    ).optional(),
    socialMedia: Joi.object({
      twitter: Joi.string().trim().optional(),
      facebook: Joi.string().trim().optional(),
      instagram: Joi.string().trim().optional(),
      linkedin: Joi.string().trim().optional()
    }).optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Deceased', 'Retired').optional()
  }),

  update: Joi.object({
    firstName: Joi.string().trim().max(50).optional().messages({
      'string.max': 'First name cannot exceed 50 characters'
    }),
    lastName: Joi.string().trim().max(50).optional().messages({
      'string.max': 'Last name cannot exceed 50 characters'
    }),
    penName: Joi.string().trim().max(100).optional().messages({
      'string.max': 'Pen name cannot exceed 100 characters'
    }),
    bio: Joi.string().max(2000).optional().allow('').messages({
      'string.max': 'Bio cannot exceed 2000 characters'
    }),
    birthDate: Joi.date().optional(),
    deathDate: Joi.date().optional().when('birthDate', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('birthDate')).messages({
        'date.greater': 'Death date must be after birth date'
      })
    }),
    nationality: Joi.string().trim().max(50).optional().messages({
      'string.max': 'Nationality cannot exceed 50 characters'
    }),
    website: Joi.string().trim().uri().optional().allow('').messages({
      'string.uri': 'Website must be a valid URL'
    }),
    email: Joi.string().trim().email().optional().allow('').messages({
      'string.email': 'Please provide a valid email address'
    }),
    phone: Joi.string().trim().optional(),
    profileImage: Joi.string().trim().uri().optional().allow('').messages({
      'string.uri': 'Profile image must be a valid URL'
    }),
    genres: Joi.array().items(
      Joi.string().valid(
        'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
        'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
        'Drama', 'Thriller', 'Horror', 'Children', 'Young Adult',
        'Philosophy', 'Science', 'Technology', 'Academic', 'Other'
      )
    ).optional(),
    languages: Joi.array().items(
      Joi.string().valid('English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Other')
    ).optional(),
    awards: Joi.array().items(
      Joi.object({
        name: Joi.string().trim().required(),
        year: Joi.number().integer().min(1000).max(new Date().getFullYear()).required().messages({
          'number.min': 'Award year must be after 1000',
          'number.max': 'Award year cannot be in the future'
        }),
        description: Joi.string().trim().optional()
      })
    ).optional(),
    socialMedia: Joi.object({
      twitter: Joi.string().trim().optional(),
      facebook: Joi.string().trim().optional(),
      instagram: Joi.string().trim().optional(),
      linkedin: Joi.string().trim().optional()
    }).optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Deceased', 'Retired').optional()
  })
};

// Review validation schemas
const reviewValidation = {
  create: Joi.object({
    title: Joi.string().trim().max(200).required().messages({
      'string.empty': 'Review title is required',
      'string.max': 'Title cannot exceed 200 characters'
    }),
    content: Joi.string().max(5000).required().messages({
      'string.empty': 'Review content is required',
      'string.max': 'Content cannot exceed 5000 characters'
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'number.base': 'Rating must be a number'
    }),
    book: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
      'string.pattern.base': 'Book must be a valid ObjectId'
    }),
    author: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
      'string.pattern.base': 'Author must be a valid ObjectId'
    }),
    status: Joi.string().valid('Published', 'Pending', 'Hidden', 'Flagged').optional()
  }).or('book', 'author').messages({
    'object.missing': 'Review must be for either a book or an author'
  }),

  update: Joi.object({
    title: Joi.string().trim().max(200).optional().messages({
      'string.max': 'Title cannot exceed 200 characters'
    }),
    content: Joi.string().max(5000).optional().messages({
      'string.max': 'Content cannot exceed 5000 characters'
    }),
    rating: Joi.number().integer().min(1).max(5).optional().messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'number.base': 'Rating must be a number'
    }),
    book: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
      'string.pattern.base': 'Book must be a valid ObjectId'
    }),
    author: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
      'string.pattern.base': 'Author must be a valid ObjectId'
    }),
    status: Joi.string().valid('Published', 'Pending', 'Hidden', 'Flagged').optional()
  })
};

module.exports = {
  bookValidation,
  publisherValidation,
  authorValidation,
  reviewValidation,
  queryValidation
};
