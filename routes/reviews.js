const express = require('express');
const router = express.Router();
const {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getReviewsByBook,
  getReviewsByAuthor,
  markReviewHelpful
} = require('../controllers/reviews');

const { validateReviewCreation, validateReviewUpdate } = require('../middleware/validation');
const { protect } = require('../config/auth');

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get all reviews
 *     description: Retrieve a list of all reviews with optional filtering, sorting, and pagination
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for review title or content
 *       - in: query
 *         name: book
 *         schema:
 *           type: string
 *         description: Filter by book ID
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author ID (for author reviews)
 *       - in: query
 *         name: reviewer
 *         schema:
 *           type: string
 *         description: Filter by reviewer ID
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by rating
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Published, Pending, Hidden, Flagged]
 *         description: Filter by review status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, rating, helpful, createdAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: List of reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     count:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                       book:
 *                         type: string
 *                       author:
 *                         type: string
 *                       reviewer:
 *                         type: string
 *                       helpful:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new review
 *     description: Create a new review for a book or author
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - rating
 *             oneOf:
 *               - required: [book]
 *               - required: [author]
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Review title
 *               content:
 *                 type: string
 *                 maxLength: 5000
 *                 description: Review content
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating (1-5 stars)
 *               book:
 *                 type: string
 *                 description: Book ID to review (mutually exclusive with author)
 *               author:
 *                 type: string
 *                 description: Author ID to review (mutually exclusive with book)
 *               status:
 *                 type: string
 *                 enum: [Published, Pending, Hidden, Flagged]
 *                 description: Review status
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Get review by ID
 *     description: Retrieve a specific review by its ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update review
 *     description: Update an existing review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Review title
 *               content:
 *                 type: string
 *                 maxLength: 5000
 *                 description: Review content
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating (1-5 stars)
 *               book:
 *                 type: string
 *                 description: Book ID to review
 *               author:
 *                 type: string
 *                 description: Author ID to review
 *               status:
 *                 type: string
 *                 enum: [Published, Pending, Hidden, Flagged]
 *                 description: Review status
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete review
 *     description: Delete a review by ID
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties: {}
 *                 message:
 *                   type: string
 *                   example: "Review deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/reviews/book/{bookId}:
 *   get:
 *     summary: Get reviews for a book
 *     description: Retrieve all reviews for a specific book
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/reviews/author/{authorId}:
 *   get:
 *     summary: Get reviews for an author
 *     description: Retrieve all reviews for a specific author
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/reviews/{id}/helpful:
 *   post:
 *     summary: Mark review as helpful
 *     description: Increment the helpful count for a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review marked as helpful successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *                 message:
 *                   type: string
 *                   example: "Review marked as helpful"
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */

// Review routes
router.route('/')
  .get(getAllReviews)
  .post(protect, validateReviewCreation, createReview);

router.route('/:id')
  .get(getReviewById)
  .put(protect, validateReviewUpdate, updateReview)
  .delete(protect, deleteReview);

router.get('/book/:bookId', getReviewsByBook);
router.get('/author/:authorId', getReviewsByAuthor);
router.post('/:id/helpful', markReviewHelpful);

module.exports = router;
