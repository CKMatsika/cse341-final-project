const mongoose = require('mongoose');
const Review = require('../models/Review');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getAllReviews = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: 0,
        pagination: { current: 1, total: 0, count: 0 },
        data: [],
        message: 'Database not connected - returning empty results'
      });
    }

    // Build query
    let query = {};

    // Add search functionality
    if (req.query.search) {
      query.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { content: new RegExp(req.query.search, 'i') }
      ];
    }

    // Filter by book
    if (req.query.book) {
      query.book = req.query.book;
    }

    // Filter by author (for author reviews)
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Filter by reviewer
    if (req.query.reviewer) {
      query.reviewer = req.query.reviewer;
    }

    // Filter by rating
    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Build sort options
    let sortOptions = {};
    if (req.query.sortBy) {
      const sortField = req.query.sortBy === 'title' ? 'title' :
                       req.query.sortBy === 'rating' ? 'rating' :
                       req.query.sortBy === 'helpful' ? 'helpful' : 'createdAt';
      sortOptions[sortField] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default sort by newest first
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('book', 'title author')
      .populate('author', 'firstName lastName')
      .populate('reviewer', 'name')
      .sort(sortOptions)
      .limit(limit)
      .skip(startIndex);

    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: reviews.length
    };

    res.status(200).json({
      success: true,
      count: reviews.length,
      pagination,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({
        success: false,
        error: 'Database not connected'
      });
    }

    const review = await Review.findById(req.params.id)
      .populate('book', 'title author')
      .populate('author', 'firstName lastName')
      .populate('reviewer', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (requires authentication)
const createReview = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected - cannot create review'
      });
    }

    // Add user to req.body if authentication is implemented
    // req.body.reviewer = req.user.id;

    const review = await Review.create(req.body);

    // Populate the related data
    await review.populate('book', 'title author');
    await review.populate('author', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this item'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (requires authentication)
const updateReview = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected - cannot update review'
      });
    }

    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if user is the reviewer (if authentication is implemented)
    // if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(401).json({
    //     success: false,
    //     error: 'Not authorized to update this review'
    //   });
    // }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('book', 'title author')
      .populate('author', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (requires authentication)
const deleteReview = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected - cannot delete review'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if user is the reviewer (if authentication is implemented)
    // if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(401).json({
    //     success: false,
    //     error: 'Not authorized to delete this review'
    //   });
    // }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Review deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get reviews for a specific book
// @route   GET /api/reviews/book/:bookId
// @access  Public
const getReviewsByBook = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'Database not connected - returning empty results'
      });
    }

    const reviews = await Review.find({
      book: req.params.bookId,
      status: 'Published'
    }).populate('reviewer', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get reviews for a specific author
// @route   GET /api/reviews/author/:authorId
// @access  Public
const getReviewsByAuthor = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'Database not connected - returning empty results'
      });
    }

    const reviews = await Review.find({
      author: req.params.authorId,
      status: 'Published'
    }).populate('reviewer', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Author not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Public
const markReviewHelpful = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected'
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review,
      message: 'Review marked as helpful'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getReviewsByBook,
  getReviewsByAuthor,
  markReviewHelpful
};
