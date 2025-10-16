const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Review = require('../../models/Review');
const Book = require('../../models/Book');
const Author = require('../../models/Author');
const User = require('../../models/User');

// Test data
const testUser = {
  googleId: 'test-google-id-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'reader'
};

const testAuthor = {
  firstName: 'John',
  lastName: 'Doe',
  bio: 'A famous test author',
  nationality: 'American',
  genres: ['Fiction', 'Mystery'],
  status: 'Active'
};

const testBook = {
  title: 'Test Book',
  isbn: '1234567890',
  description: 'A test book for unit testing',
  publicationDate: new Date('2023-01-01'),
  genre: ['Fiction', 'Mystery'],
  language: 'English',
  pages: 200,
  format: 'Paperback',
  price: 19.99
};

const testReview = {
  title: 'Great Book!',
  content: 'This is an excellent book that I really enjoyed reading.',
  rating: 5,
  status: 'Published'
};

describe('Reviews API - GET Endpoints', () => {
  let userId, authorId, bookId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/literary-test');

    // Create test user, author, and book
    const user = await User.create(testUser);
    const author = await Author.create(testAuthor);
    const book = await Book.create({
      ...testBook,
      author: author._id
    });

    userId = user._id;
    authorId = author._id;
    bookId = book._id;
  });

  afterAll(async () => {
    // Clean up test database
    await Review.deleteMany({});
    await Book.deleteMany({});
    await Author.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear reviews collection before each test
    await Review.deleteMany({});
  });

  describe('GET /api/reviews', () => {
    it('should return empty array when no reviews exist', async () => {
      const res = await request(app)
        .get('/api/reviews')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination).toBeDefined();
    });

    it('should return all reviews when they exist', async () => {
      // Create test reviews
      await Review.create({
        ...testReview,
        book: bookId,
        reviewer: userId
      });
      await Review.create({
        ...testReview,
        title: 'Another Review',
        author: authorId,
        reviewer: userId
      });

      const res = await request(app)
        .get('/api/reviews')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toHaveProperty('title');
      expect(res.body.data[0]).toHaveProperty('content');
      expect(res.body.data[0]).toHaveProperty('rating');
    });

    it('should support search query parameter', async () => {
      // Create test review
      await Review.create({
        ...testReview,
        title: 'Amazing Book Review',
        book: bookId,
        reviewer: userId
      });

      const res = await request(app)
        .get('/api/reviews?search=Amazing')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].title).toContain('Amazing');
    });

    it('should support book filtering', async () => {
      // Create test review for specific book
      await Review.create({
        ...testReview,
        title: 'Book Review',
        book: bookId,
        reviewer: userId
      });

      const res = await request(app)
        .get(`/api/reviews?book=${bookId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].book).toBe(bookId.toString());
    });

    it('should support author filtering', async () => {
      // Create test review for specific author
      await Review.create({
        ...testReview,
        title: 'Author Review',
        author: authorId,
        reviewer: userId
      });

      const res = await request(app)
        .get(`/api/reviews?author=${authorId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].author).toBe(authorId.toString());
    });

    it('should support rating filtering', async () => {
      // Create test reviews with different ratings
      await Review.create({
        ...testReview,
        rating: 5,
        book: bookId,
        reviewer: userId
      });
      await Review.create({
        ...testReview,
        title: 'Okay Book',
        rating: 3,
        book: bookId,
        reviewer: userId
      });

      const res = await request(app)
        .get('/api/reviews?rating=5')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].rating).toBe(5);
    });

    it('should support status filtering', async () => {
      // Create test reviews with different statuses
      await Review.create({
        ...testReview,
        status: 'Published',
        book: bookId,
        reviewer: userId
      });
      await Review.create({
        ...testReview,
        title: 'Pending Review',
        status: 'Pending',
        book: bookId,
        reviewer: userId
      });

      const res = await request(app)
        .get('/api/reviews?status=Published')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].status).toBe('Published');
    });

    it('should support sorting', async () => {
      // Create test reviews
      await Review.create({
        ...testReview,
        title: 'Z Review',
        rating: 4,
        book: bookId,
        reviewer: userId
      });
      await Review.create({
        ...testReview,
        title: 'A Review',
        rating: 5,
        book: bookId,
        reviewer: userId
      });

      const res = await request(app)
        .get('/api/reviews?sortBy=rating&sortOrder=desc')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data[0].rating).toBe(5);
      expect(res.body.data[1].rating).toBe(4);
    });

    it('should support pagination', async () => {
      // Create multiple test reviews
      for (let i = 0; i < 5; i++) {
        await Review.create({
          ...testReview,
          title: `Test Review ${i}`,
          book: bookId,
          reviewer: userId
        });
      }

      const res = await request(app)
        .get('/api/reviews?page=1&limit=2')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.pagination.current).toBe(1);
      expect(res.body.pagination.total).toBe(3); // 5 items / 2 per page = 3 pages
    });
  });

  describe('GET /api/reviews/:id', () => {
    it('should return 404 for non-existent review', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/reviews/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Review not found');
    });

    it('should return review by valid ID', async () => {
      const review = await Review.create({
        ...testReview,
        book: bookId,
        reviewer: userId
      });

      const res = await request(app)
        .get(`/api/reviews/${review._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Great Book!');
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.book).toBe(bookId.toString());
    });

    it('should return 404 for invalid ObjectId format', async () => {
      const res = await request(app)
        .get('/api/reviews/invalid-id')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Review not found');
    });
  });

  describe('GET /api/reviews/book/:bookId', () => {
    it('should return reviews for a book', async () => {
      // Create test reviews for the book
      await Review.create({
        ...testReview,
        title: 'Book Review 1',
        book: bookId,
        reviewer: userId
      });
      await Review.create({
        ...testReview,
        title: 'Book Review 2',
        book: bookId,
        reviewer: userId
      });

      const res = await request(app)
        .get(`/api/reviews/book/${bookId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].book).toBe(bookId.toString());
      expect(res.body.data[1].book).toBe(bookId.toString());
    });

    it('should return empty array for book with no reviews', async () => {
      const res = await request(app)
        .get(`/api/reviews/book/${bookId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/reviews/author/:authorId', () => {
    it('should return reviews for an author', async () => {
      // Create test reviews for the author
      await Review.create({
        ...testReview,
        title: 'Author Review 1',
        author: authorId,
        reviewer: userId
      });
      await Review.create({
        ...testReview,
        title: 'Author Review 2',
        author: authorId,
        reviewer: userId
      });

      const res = await request(app)
        .get(`/api/reviews/author/${authorId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].author).toBe(authorId.toString());
      expect(res.body.data[1].author).toBe(authorId.toString());
    });

    it('should return empty array for author with no reviews', async () => {
      const res = await request(app)
        .get(`/api/reviews/author/${authorId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });
});
