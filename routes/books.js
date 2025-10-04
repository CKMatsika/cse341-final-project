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

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     description: Retrieve a list of all books with optional filtering, sorting, and pagination
 *     tags: [Books]
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
 *         description: Search query for book title or description
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *       - in: query
 *         name: publisher
 *         schema:
 *           type: string
 *         description: Filter by publisher ID
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           enum: [Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, Poetry, Drama, Thriller, Horror, Children, Young Adult, Philosophy, Science, Technology, Other]
 *         description: Filter by genre
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, publicationDate, averageRating, createdAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: List of books retrieved successfully
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
 *                     $ref: '#/components/schemas/Book'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   post:
 *     summary: Create a new book
 *     description: Create a new book with the provided information
 *     tags: [Books]
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
 *               - author
 *               - publicationDate
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Book title
 *               isbn:
 *                 type: string
 *                 description: International Standard Book Number
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Book description
 *               author:
 *                 type: string
 *                 description: Author ObjectId reference
 *               publisher:
 *                 type: string
 *                 description: Publisher ObjectId reference
 *               publicationDate:
 *                 type: string
 *                 format: date
 *                 description: Publication date
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, Poetry, Drama, Thriller, Horror, Children, Young Adult, Philosophy, Science, Technology, Other]
 *                 description: Book genres
 *               language:
 *                 type: string
 *                 enum: [English, Spanish, French, German, Italian, Portuguese, Other]
 *                 description: Book language
 *               pages:
 *                 type: number
 *                 minimum: 1
 *                 description: Number of pages
 *               format:
 *                 type: string
 *                 enum: [Hardcover, Paperback, E-book, Audiobook]
 *                 description: Book format
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Book price
 *               coverImage:
 *                 type: string
 *                 format: uri
 *                 description: Cover image URL
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Book tags
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get book by ID
 *     description: Retrieve a specific book by its ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   put:
 *     summary: Update book
 *     description: Update an existing book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
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
 *                 description: Book title
 *               isbn:
 *                 type: string
 *                 description: International Standard Book Number
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Book description
 *               author:
 *                 type: string
 *                 description: Author ObjectId reference
 *               publisher:
 *                 type: string
 *                 description: Publisher ObjectId reference
 *               publicationDate:
 *                 type: string
 *                 format: date
 *                 description: Publication date
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, Poetry, Drama, Thriller, Horror, Children, Young Adult, Philosophy, Science, Technology, Other]
 *                 description: Book genres
 *               language:
 *                 type: string
 *                 enum: [English, Spanish, French, German, Italian, Portuguese, Other]
 *                 description: Book language
 *               pages:
 *                 type: number
 *                 minimum: 1
 *                 description: Number of pages
 *               format:
 *                 type: string
 *                 enum: [Hardcover, Paperback, E-book, Audiobook]
 *                 description: Book format
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Book price
 *               coverImage:
 *                 type: string
 *                 format: uri
 *                 description: Cover image URL
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Book tags
 *               status:
 *                 type: string
 *                 enum: [Published, Upcoming, Out of Print, Cancelled]
 *                 description: Publication status
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     summary: Delete book
 *     description: Delete a book by ID
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
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
 *                   example: "Book deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/books/author/{authorId}:
 *   get:
 *     summary: Get books by author
 *     description: Retrieve all books by a specific author
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Books retrieved successfully
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
 *                     $ref: '#/components/schemas/Book'
 *       404:
 *         description: Author not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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
