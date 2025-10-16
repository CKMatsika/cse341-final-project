const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Book = require('../../models/Book');
const Author = require('../../models/Author');
const Publisher = require('../../models/Publisher');

// Test data
const testAuthor = {
  firstName: 'John',
  lastName: 'Doe',
  bio: 'A famous test author',
  nationality: 'American',
  genres: ['Fiction', 'Mystery'],
  status: 'Active'
};

const testPublisher = {
  name: 'Test Publisher',
  description: 'A test publishing company',
  foundedYear: 2000,
  headquarters: {
    city: 'New York',
    country: 'USA'
  },
  website: 'https://testpublisher.com',
  email: 'info@testpublisher.com',
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

describe('Books API - GET Endpoints', () => {
  let authorId, publisherId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/literary-test');

    // Create test author and publisher
    const author = await Author.create(testAuthor);
    const publisher = await Publisher.create(testPublisher);
    authorId = author._id;
    publisherId = publisher._id;
  });

  afterAll(async () => {
    // Clean up test database
    await Book.deleteMany({});
    await Author.deleteMany({});
    await Publisher.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear books collection before each test
    await Book.deleteMany({});
  });

  describe('GET /api/books', () => {
    it('should return empty array when no books exist', async () => {
      const res = await request(app)
        .get('/api/books')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination).toBeDefined();
    });

    it('should return all books when they exist', async () => {
      // Create test book
      const book = await Book.create({
        ...testBook,
        author: authorId,
        publisher: publisherId
      });

      const res = await request(app)
        .get('/api/books')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toHaveProperty('title');
      expect(res.body.data[0]).toHaveProperty('author');
      expect(res.body.data[0]).toHaveProperty('publisher');
    });

    it('should support search query parameter', async () => {
      // Create test book
      await Book.create({
        ...testBook,
        title: 'Mystery Book',
        author: authorId,
        publisher: publisherId
      });

      const res = await request(app)
        .get('/api/books?search=Mystery')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].title).toContain('Mystery');
    });

    it('should support author filtering', async () => {
      // Create test book with specific author
      await Book.create({
        ...testBook,
        title: 'Book by John Doe',
        author: authorId,
        publisher: publisherId
      });

      const res = await request(app)
        .get(`/api/books?author=${authorId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].author).toBe(authorId.toString());
    });

    it('should support publisher filtering', async () => {
      // Create test book with specific publisher
      await Book.create({
        ...testBook,
        title: 'Book from Test Publisher',
        author: authorId,
        publisher: publisherId
      });

      const res = await request(app)
        .get(`/api/books?publisher=${publisherId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].publisher).toBe(publisherId.toString());
    });

    it('should support genre filtering', async () => {
      // Create test book with specific genre
      await Book.create({
        ...testBook,
        title: 'Fiction Book',
        genre: ['Fiction'],
        author: authorId,
        publisher: publisherId
      });

      const res = await request(app)
        .get('/api/books?genre=Fiction')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].genre).toContain('Fiction');
    });

    it('should support sorting', async () => {
      // Create test books
      await Book.create({
        ...testBook,
        title: 'A Book',
        author: authorId,
        publisher: publisherId
      });
      await Book.create({
        ...testBook,
        title: 'Z Book',
        author: authorId,
        publisher: publisherId
      });

      const res = await request(app)
        .get('/api/books?sortBy=title&sortOrder=asc')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data[0].title).toBe('A Book');
      expect(res.body.data[1].title).toBe('Z Book');
    });

    it('should support pagination', async () => {
      // Create multiple test books
      for (let i = 0; i < 5; i++) {
        await Book.create({
          ...testBook,
          title: `Test Book ${i}`,
          author: authorId,
          publisher: publisherId
        });
      }

      const res = await request(app)
        .get('/api/books?page=1&limit=2')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.pagination.current).toBe(1);
      expect(res.body.pagination.total).toBe(3); // 5 items / 2 per page = 3 pages
    });
  });

  describe('GET /api/books/:id', () => {
    it('should return 404 for non-existent book', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/books/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Book not found');
    });

    it('should return book by valid ID', async () => {
      const book = await Book.create({
        ...testBook,
        author: authorId,
        publisher: publisherId
      });

      const res = await request(app)
        .get(`/api/books/${book._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Book');
      expect(res.body.data.author).toBe(authorId.toString());
      expect(res.body.data.publisher).toBe(publisherId.toString());
    });

    it('should return 404 for invalid ObjectId format', async () => {
      const res = await request(app)
        .get('/api/books/invalid-id')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Book not found');
    });

    it('should populate author and publisher data', async () => {
      const book = await Book.create({
        ...testBook,
        author: authorId,
        publisher: publisherId
      });

      const res = await request(app)
        .get(`/api/books/${book._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.author).toHaveProperty('firstName');
      expect(res.body.data.author).toHaveProperty('lastName');
      expect(res.body.data.publisher).toHaveProperty('name');
    });
  });

  describe('GET /api/books/author/:authorId', () => {
    it('should return books by author', async () => {
      // Create test books for the same author
      await Book.create({
        ...testBook,
        title: 'Book 1 by John Doe',
        author: authorId,
        publisher: publisherId
      });
      await Book.create({
        ...testBook,
        title: 'Book 2 by John Doe',
        author: authorId,
        publisher: publisherId
      });

      const res = await request(app)
        .get(`/api/books/author/${authorId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].author).toBe(authorId.toString());
      expect(res.body.data[1].author).toBe(authorId.toString());
    });

    it('should return empty array for author with no books', async () => {
      const newAuthor = await Author.create({
        ...testAuthor,
        firstName: 'New',
        lastName: 'Author'
      });

      const res = await request(app)
        .get(`/api/books/author/${newAuthor._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });

    it('should return 404 for non-existent author', async () => {
      const fakeAuthorId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/books/author/${fakeAuthorId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Author not found');
    });
  });
});
