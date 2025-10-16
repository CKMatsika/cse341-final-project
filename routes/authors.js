const express = require('express');
const router = express.Router();
const {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorsByGenre,
  getAuthorStats
} = require('../controllers/authors');

const { validateAuthorCreation, validateAuthorUpdate } = require('../middleware/validation');
const { protect } = require('../config/auth');

/**
 * @swagger
 * /api/authors:
 *   get:
 *     summary: Get all authors
 *     description: Retrieve a list of all authors with optional filtering, sorting, and pagination
 *     tags: [Authors]
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
 *         description: Search query for author name, pen name, or bio
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           enum: [Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, Poetry, Drama, Thriller, Horror, Children, Young Adult, Philosophy, Science, Technology, Academic, Other]
 *         description: Filter by genre
 *       - in: query
 *         name: nationality
 *         schema:
 *           type: string
 *         description: Filter by nationality
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, Deceased, Retired]
 *         description: Filter by author status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [firstName, lastName, birthDate, createdAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: List of authors retrieved successfully
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
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       penName:
 *                         type: string
 *                       nationality:
 *                         type: string
 *                       genres:
 *                         type: array
 *                         items:
 *                           type: string
 *                       status:
 *                         type: string
 *                       profileImage:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new author
 *     description: Create a new author with the provided information
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 50
 *                 description: Author's first name
 *               lastName:
 *                 type: string
 *                 maxLength: 50
 *                 description: Author's last name
 *               penName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Author's pen name or pseudonym
 *               bio:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Author's biography
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: Author's birth date
 *               deathDate:
 *                 type: string
 *                 format: date
 *                 description: Author's death date (if applicable)
 *               nationality:
 *                 type: string
 *                 maxLength: 50
 *                 description: Author's nationality
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Author's website URL
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Author's email address
 *               phone:
 *                 type: string
 *                 description: Author's phone number
 *               profileImage:
 *                 type: string
 *                 format: uri
 *                 description: Author's profile image URL
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, Poetry, Drama, Thriller, Horror, Children, Young Adult, Philosophy, Science, Technology, Academic, Other]
 *                 description: Author's literary genres
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [English, Spanish, French, German, Italian, Portuguese, Other]
 *                 description: Languages the author writes in
 *               awards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Award name
 *                     year:
 *                       type: number
 *                       minimum: 1000
 *                       maximum: 2024
 *                       description: Award year
 *                     description:
 *                       type: string
 *                       description: Award description
 *                 description: Author's literary awards
 *               socialMedia:
 *                 type: object
 *                 properties:
 *                   twitter:
 *                     type: string
 *                     description: Twitter handle
 *                   facebook:
 *                     type: string
 *                     description: Facebook profile
 *                   instagram:
 *                     type: string
 *                     description: Instagram handle
 *                   linkedin:
 *                     type: string
 *                     description: LinkedIn profile
 *                 description: Author's social media profiles
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Deceased, Retired]
 *                 description: Author's current status
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Author'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/authors/{id}:
 *   get:
 *     summary: Get author by ID
 *     description: Retrieve a specific author by their ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Author'
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update author
 *     description: Update an existing author's information
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 50
 *                 description: Author's first name
 *               lastName:
 *                 type: string
 *                 maxLength: 50
 *                 description: Author's last name
 *               penName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Author's pen name or pseudonym
 *               bio:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Author's biography
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: Author's birth date
 *               deathDate:
 *                 type: string
 *                 format: date
 *                 description: Author's death date (if applicable)
 *               nationality:
 *                 type: string
 *                 maxLength: 50
 *                 description: Author's nationality
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Author's website URL
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Author's email address
 *               phone:
 *                 type: string
 *                 description: Author's phone number
 *               profileImage:
 *                 type: string
 *                 format: uri
 *                 description: Author's profile image URL
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, Poetry, Drama, Thriller, Horror, Children, Young Adult, Philosophy, Science, Technology, Academic, Other]
 *                 description: Author's literary genres
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [English, Spanish, French, German, Italian, Portuguese, Other]
 *                 description: Languages the author writes in
 *               awards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Award name
 *                     year:
 *                       type: number
 *                       minimum: 1000
 *                       maximum: 2024
 *                       description: Award year
 *                     description:
 *                       type: string
 *                       description: Award description
 *                 description: Author's literary awards
 *               socialMedia:
 *                 type: object
 *                 properties:
 *                   twitter:
 *                     type: string
 *                     description: Twitter handle
 *                   facebook:
 *                     type: string
 *                     description: Facebook profile
 *                   instagram:
 *                     type: string
 *                     description: Instagram handle
 *                   linkedin:
 *                     type: string
 *                     description: LinkedIn profile
 *                 description: Author's social media profiles
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Deceased, Retired]
 *                 description: Author's current status
 *     responses:
 *       200:
 *         description: Author updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Author'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete author
 *     description: Delete an author by ID
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author deleted successfully
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
 *                   example: "Author deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/authors/genre/{genre}:
 *   get:
 *     summary: Get authors by genre
 *     description: Retrieve all authors who write in a specific genre
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, Poetry, Drama, Thriller, Horror, Children, Young Adult, Philosophy, Science, Technology, Academic, Other]
 *         description: Literary genre
 *     responses:
 *       200:
 *         description: Authors retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       penName:
 *                         type: string
 *                       nationality:
 *                         type: string
 *                       genres:
 *                         type: array
 *                         items:
 *                           type: string
 *                       profileImage:
 *                         type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/authors/{id}/stats:
 *   get:
 *     summary: Get author statistics
 *     description: Retrieve statistics for a specific author including book count and ratings
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author statistics retrieved successfully
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
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       example: "John Doe"
 *                     booksCount:
 *                       type: integer
 *                       example: 5
 *                     averageRating:
 *                       type: number
 *                       example: 4.2
 *                     genres:
 *                       type: array
 *                       items:
 *                         type: string
 *                     nationality:
 *                       type: string
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */

// Author routes
router.route('/')
  .get(getAllAuthors)
  .post(protect, validateAuthorCreation, createAuthor);

router.route('/:id')
  .get(getAuthorById)
  .put(protect, validateAuthorUpdate, updateAuthor)
  .delete(protect, deleteAuthor);

router.get('/genre/:genre', getAuthorsByGenre);
router.get('/:id/stats', getAuthorStats);

module.exports = router;
