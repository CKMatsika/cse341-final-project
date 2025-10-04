const mongoose = require('mongoose');
const Book = require('../models/Book');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getAllBooks = async (req, res) => {
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

    // Filter by author
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Filter by publisher
    if (req.query.publisher) {
      query.publisher = req.query.publisher;
    }

    // Filter by genre
    if (req.query.genre) {
      query.genre = req.query.genre;
    }

    // Build sort options
    let sortOptions = {};
    if (req.query.sortBy) {
      sortOptions[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default sort by newest first
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('author', 'firstName lastName')
      .populate('publisher', 'name')
      .sort(sortOptions)
      .limit(limit)
      .skip(startIndex);

    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: books.length
    };

    res.status(200).json({
      success: true,
      count: books.length,
      pagination,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({
        success: false,
        error: 'Database not connected'
      });
    }

    const book = await Book.findById(req.params.id)
      .populate('author', 'firstName lastName bio nationality')
      .populate('publisher', 'name description website');

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      data: book
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

// @desc    Create new book
// @route   POST /api/books
// @access  Private (requires authentication)
const createBook = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected - cannot create book'
      });
    }

    // Add user to req.body if authentication is implemented
    // req.body.createdBy = req.user.id;

    const book = await Book.create(req.body);

    // Populate the author and publisher data
    await book.populate('author', 'firstName lastName');
    await book.populate('publisher', 'name');

    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Book with this ISBN already exists'
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

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (requires authentication)
const updateBook = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected - cannot update book'
      });
    }

    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('author', 'firstName lastName')
      .populate('publisher', 'name');

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Book with this ISBN already exists'
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

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (requires authentication)
const deleteBook = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected - cannot delete book'
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Book deleted successfully'
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

// @desc    Get books by author
// @route   GET /api/books/author/:authorId
// @access  Public
const getBooksByAuthor = async (req, res) => {
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

    const books = await Book.find({ author: req.params.authorId })
      .populate('author', 'firstName lastName')
      .populate('publisher', 'name')
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
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBooksByAuthor
};
