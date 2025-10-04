const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBooksByAuthor
} = require('../controllers/books');

const { validateBookCreation, validateBookUpdate } = require('../middleware/validation');

// Book routes
router.route('/')
  .get(getAllBooks)
  .post(validateBookCreation, createBook);

router.route('/:id')
  .get(getBookById)
  .put(validateBookUpdate, updateBook)
  .delete(deleteBook);

router.get('/author/:authorId', getBooksByAuthor);

module.exports = router;
