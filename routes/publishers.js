const express = require('express');
const router = express.Router();
const {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
  getPublishersByGenre,
  getPublisherBooks
} = require('../controllers/publishers');

const { validatePublisherCreation, validatePublisherUpdate } = require('../middleware/validation');

// Publisher routes
router.route('/')
  .get(getAllPublishers)
  .post(validatePublisherCreation, createPublisher);

router.route('/:id')
  .get(getPublisherById)
  .put(validatePublisherUpdate, updatePublisher)
  .delete(deletePublisher);

router.get('/genre/:genre', getPublishersByGenre);
router.get('/:id/books', getPublisherBooks);

module.exports = router;
