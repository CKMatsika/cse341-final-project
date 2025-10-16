const mongoose = require('mongoose');
const Author = require('../models/Author');

// @desc    Get all authors
// @route   GET /api/authors
// @access  Public
const getAllAuthors = async (req, res) => {
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

    // Filter by nationality
    if (req.query.nationality) {
      query.nationality = new RegExp(req.query.nationality, 'i');
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Build sort options
    let sortOptions = {};
    if (req.query.sortBy) {
      const sortField = req.query.sortBy === 'firstName' ? 'firstName' :
                       req.query.sortBy === 'lastName' ? 'lastName' :
                       req.query.sortBy === 'birthDate' ? 'birthDate' : 'createdAt';
      sortOptions[sortField] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default sort by newest first
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Author.countDocuments(query);
    const authors = await Author.find(query)
      .select('firstName lastName penName nationality genres status profileImage createdAt')
      .sort(sortOptions)
      .limit(limit)
      .skip(startIndex);

    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: authors.length
    };

    res.status(200).json({
      success: true,
      count: authors.length,
      pagination,
      data: authors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single author
// @route   GET /api/authors/:id
// @access  Public
const getAuthorById = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({
        success: false,
        error: 'Database not connected'
      });
    }

    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        success: false,
        error: 'Author not found'
      });
    }

    res.status(200).json({
      success: true,
      data: author
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

// @desc    Create new author
// @route   POST /api/authors
// @access  Private (requires authentication)
const createAuthor = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected - cannot create author'
      });
    }

    // Add user to req.body if authentication is implemented
    // req.body.createdBy = req.user.id;

    const author = await Author.create(req.body);

    res.status(201).json({
      success: true,
      data: author
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

// @desc    Update author
// @route   PUT /api/authors/:id
// @access  Private (requires authentication)
const updateAuthor = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected - cannot update author'
      });
    }

    let author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        success: false,
        error: 'Author not found'
      });
    }

    author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: author
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Author not found'
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

// @desc    Delete author
// @route   DELETE /api/authors/:id
// @access  Private (requires authentication)
const deleteAuthor = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected - cannot delete author'
      });
    }

    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        success: false,
        error: 'Author not found'
      });
    }

    await Author.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Author deleted successfully'
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

// @desc    Get authors by genre
// @route   GET /api/authors/genre/:genre
// @access  Public
const getAuthorsByGenre = async (req, res) => {
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

    const authors = await Author.find({
      genres: req.params.genre,
      status: { $ne: 'Deceased' } // Exclude deceased authors by default
    }).select('firstName lastName penName nationality genres profileImage')
      .sort({ lastName: 1, firstName: 1 });

    res.status(200).json({
      success: true,
      count: authors.length,
      data: authors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get author statistics
// @route   GET /api/authors/:id/stats
// @access  Public
const getAuthorStats = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({
        success: false,
        error: 'Database not connected'
      });
    }

    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        success: false,
        error: 'Author not found'
      });
    }

    const stats = await Author.getAuthorStats(req.params.id);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        fullName: author.fullName,
        booksCount: 0,
        averageRating: 0,
        genres: author.genres,
        nationality: author.nationality
      }
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

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorsByGenre,
  getAuthorStats
};
