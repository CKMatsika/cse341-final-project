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

/**
 * @swagger
 * /api/publishers:
 *   get:
 *     summary: Get all publishers
 *     description: Retrieve a list of all publishers with optional filtering and sorting
 *     tags: [Publishers]
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
 *         description: Search query for publisher name or description
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           enum: [Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, Poetry, Drama, Thriller, Horror, Children, Young Adult, Philosophy, Science, Technology, Academic, Other]
 *         description: Filter by genre
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, Acquired, Defunct]
 *         description: Filter by status
 *       - in: query
 *         name: foundedAfter
 *         schema:
 *           type: integer
 *           minimum: 1400
 *         description: Filter by founded year (after)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, foundedYear, createdAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: List of publishers retrieved successfully
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
 *                     $ref: '#/components/schemas/Publisher'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   post:
 *     summary: Create a new publisher
 *     description: Create a new publisher with the provided information
 *     tags: [Publishers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Publisher name
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Publisher description
 *               foundedYear:
 *                 type: number
 *                 minimum: 1400
 *                 maximum: 2024
 *                 description: Year publisher was founded
 *               headquarters:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     maxLength: 50
 *                     description: City
 *                   country:
 *                     type: string
 *                     maxLength: 50
 *                     description: Country
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Publisher website
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contact email
 *               phone:
 *                 type: string
 *                 description: Contact phone
 *               logo:
 *                 type: string
 *                 format: uri
 *                 description: Publisher logo URL
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, Poetry, Drama, Thriller, Horror, Children, Young Adult, Philosophy, Science, Technology, Academic, Other]
 *                 description: Publisher genres
 *               imprint:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Imprint name
 *                     description:
 *                       type: string
 *                       description: Imprint description
 *                 description: Publisher imprints
 *               socialMedia:
 *                 type: object
 *                 properties:
 *                   twitter:
 *                     type: string
 *                     description: Twitter handle
 *                   facebook:
 *                     type: string
 *                     description: Facebook page
 *                   instagram:
 *                     type: string
 *                     description: Instagram handle
 *                   linkedin:
 *                     type: string
 *                     description: LinkedIn page
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Acquired, Defunct]
 *                 description: Publisher status
 *     responses:
 *       201:
 *         description: Publisher created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Publisher'
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
 * /api/publishers/{id}:
 *   get:
 *     summary: Get publisher by ID
 *     description: Retrieve a specific publisher by its ID with statistics
 *     tags: [Publishers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publisher ID
 *     responses:
 *       200:
 *         description: Publisher retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Publisher'
 *                 stats:
 *                   type: object
 *                   properties:
 *                     booksCount:
 *                       type: integer
 *                     averageRating:
 *                       type: number
 *       404:
 *         description: Publisher not found
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
 *     summary: Update publisher
 *     description: Update an existing publisher
 *     tags: [Publishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publisher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Publisher name
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Publisher description
 *               foundedYear:
 *                 type: number
 *                 minimum: 1400
 *                 maximum: 2024
 *                 description: Year publisher was founded
 *               headquarters:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     maxLength: 50
 *                     description: City
 *                   country:
 *                     type: string
 *                     maxLength: 50
 *                     description: Country
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Publisher website
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contact email
 *               phone:
 *                 type: string
 *                 description: Contact phone
 *               logo:
 *                 type: string
 *                 format: uri
 *                 description: Publisher logo URL
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, Poetry, Drama, Thriller, Horror, Children, Young Adult, Philosophy, Science, Technology, Academic, Other]
 *                 description: Publisher genres
 *               imprint:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Imprint name
 *                     description:
 *                       type: string
 *                       description: Imprint description
 *                 description: Publisher imprints
 *               socialMedia:
 *                 type: object
 *                 properties:
 *                   twitter:
 *                     type: string
 *                     description: Twitter handle
 *                   facebook:
 *                     type: string
 *                     description: Facebook page
 *                   instagram:
 *                     type: string
 *                     description: Instagram handle
 *                   linkedin:
 *                     type: string
 *                     description: LinkedIn page
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Acquired, Defunct]
 *                 description: Publisher status
 *     responses:
 *       200:
 *         description: Publisher updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Publisher'
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
 *         description: Publisher not found
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
 *     summary: Delete publisher
 *     description: Delete a publisher by ID
 *     tags: [Publishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publisher ID
 *     responses:
 *       200:
 *         description: Publisher deleted successfully
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
 *                   example: "Publisher deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Publisher not found
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
 * /api/publishers/genre/{genre}:
 *   get:
 *     summary: Get publishers by genre
 *     description: Retrieve all publishers that publish a specific genre
 *     tags: [Publishers]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, Poetry, Drama, Thriller, Horror, Children, Young Adult, Philosophy, Science, Technology, Academic, Other]
 *         description: Genre to filter by
 *     responses:
 *       200:
 *         description: Publishers retrieved successfully
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
 *                     $ref: '#/components/schemas/Publisher'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/publishers/{id}/books:
 *   get:
 *     summary: Get publisher books
 *     description: Retrieve all books published by a specific publisher
 *     tags: [Publishers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publisher ID
 *     responses:
 *       200:
 *         description: Publisher books retrieved successfully
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
 *         description: Publisher not found
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
