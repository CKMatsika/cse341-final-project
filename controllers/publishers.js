const mongoose = require('mongoose');
const Publisher = require('../models/Publisher');
const Book = require('../models/Book');

// @desc    Get all publishers
// @route   GET /api/publishers
// @access  Public
const getAllPublishers = async (req, res) => {
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
      query.$text = { $search: req.query.search };
    }

    // Filter by genre
    if (req.query.genre) {
      query.genres = req.query.genre;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by founded year
    if (req.query.foundedAfter) {
      query.foundedYear = { $gte: parseInt(req.query.foundedAfter) };
    }

    // Build sort options
    let sortOptions = {};
    if (req.query.sortBy) {
      sortOptions[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.name = 1; // Default sort alphabetically
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Publisher.countDocuments(query);
    const publishers = await Publisher.find(query)
      .sort(sortOptions)
      .limit(limit)
      .skip(startIndex);

    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: publishers.length
    };

    res.status(200).json({
      success: true,
      count: publishers.length,
      pagination,
      data: publishers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single publisher
// @route   GET /api/publishers/:id
// @access  Public
const getPublisherById = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({
        success: false,
        error: 'Database not connected'
      });
    }

    const publisher = await Publisher.findById(req.params.id);

    if (!publisher) {
      return res.status(404).json({
        success: false,
        error: 'Publisher not found'
      });
    }

    // Get publisher statistics
    const stats = await Publisher.getPublisherStats(req.params.id);

    res.status(200).json({
      success: true,
      data: publisher,
      stats: stats[0] || {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Publisher not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new publisher
// @route   POST /api/publishers
// @access  Private (requires authentication)
const createPublisher = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected - cannot create publisher'
      });
    }

    // Add user to req.body if authentication is implemented
    // req.body.createdBy = req.user.id;

    const publisher = await Publisher.create(req.body);

    res.status(201).json({
      success: true,
      data: publisher
    });
  } catch (error) {
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

// @desc    Update publisher
// @route   PUT /api/publishers/:id
// @access  Private (requires authentication)
const updatePublisher = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected - cannot update publisher'
      });
    }

    let publisher = await Publisher.findById(req.params.id);

    if (!publisher) {
      return res.status(404).json({
        success: false,
        error: 'Publisher not found'
      });
    }

    publisher = await Publisher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: publisher
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Publisher not found'
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

// @desc    Delete publisher
// @route   DELETE /api/publishers/:id
// @access  Private (requires authentication)
const deletePublisher = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected - cannot delete publisher'
      });
    }

    const publisher = await Publisher.findById(req.params.id);

    if (!publisher) {
      return res.status(404).json({
        success: false,
        error: 'Publisher not found'
      });
    }

    await Publisher.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Publisher deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Publisher not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get publishers by genre
// @route   GET /api/publishers/genre/:genre
// @access  Public
const getPublishersByGenre = async (req, res) => {
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

    const publishers = await Publisher.find({
      genres: req.params.genre,
      status: 'Active'
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: publishers.length,
      data: publishers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get publisher books
// @route   GET /api/publishers/:id/books
// @access  Public
const getPublisherBooks = async (req, res) => {
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

    const books = await Book.find({ publisher: req.params.id })
      .populate('author', 'firstName lastName')
      .sort({ publicationDate: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Publisher not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
  getPublishersByGenre,
  getPublisherBooks
};
