const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Author = require('../../models/Author');

// Test data
const testAuthor = {
  firstName: 'John',
  lastName: 'Doe',
  bio: 'A famous test author',
  nationality: 'American',
  genres: ['Fiction', 'Mystery'],
  status: 'Active'
};

describe('Authors API - GET Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/literary-test');
  });

  afterAll(async () => {
    // Clean up test database
    await Author.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear authors collection before each test
    await Author.deleteMany({});
  });

  describe('GET /api/authors', () => {
    it('should return empty array when no authors exist', async () => {
      const res = await request(app)
        .get('/api/authors')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination).toBeDefined();
    });

    it('should return all authors when they exist', async () => {
      // Create test authors
      const author1 = await Author.create(testAuthor);
      const author2 = await Author.create({
        ...testAuthor,
        firstName: 'Jane',
        lastName: 'Smith'
      });

      const res = await request(app)
        .get('/api/authors')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toHaveProperty('firstName');
      expect(res.body.data[0]).toHaveProperty('lastName');
      expect(res.body.data[0]).toHaveProperty('nationality');
    });

    it('should support search query parameter', async () => {
      // Create test author
      await Author.create(testAuthor);

      const res = await request(app)
        .get('/api/authors?search=John')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].firstName).toBe('John');
    });

    it('should support genre filtering', async () => {
      // Create test authors with different genres
      await Author.create(testAuthor); // Has 'Fiction', 'Mystery'
      await Author.create({
        ...testAuthor,
        firstName: 'Jane',
        lastName: 'Smith',
        genres: ['Romance', 'Drama']
      });

      const res = await request(app)
        .get('/api/authors?genre=Fiction')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].genres).toContain('Fiction');
    });

    it('should support nationality filtering', async () => {
      // Create test authors with different nationalities
      await Author.create(testAuthor); // American
      await Author.create({
        ...testAuthor,
        firstName: 'Jean',
        lastName: 'Pierre',
        nationality: 'French'
      });

      const res = await request(app)
        .get('/api/authors?nationality=French')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].nationality).toBe('French');
    });

    it('should support status filtering', async () => {
      // Create test authors with different statuses
      await Author.create(testAuthor); // Active
      await Author.create({
        ...testAuthor,
        firstName: 'Retired',
        lastName: 'Author',
        status: 'Retired'
      });

      const res = await request(app)
        .get('/api/authors?status=Active')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].status).toBe('Active');
    });

    it('should support sorting', async () => {
      // Create test authors
      await Author.create({ ...testAuthor, firstName: 'Alice', lastName: 'Zulu' });
      await Author.create({ ...testAuthor, firstName: 'Bob', lastName: 'Alpha' });

      const res = await request(app)
        .get('/api/authors?sortBy=firstName&sortOrder=asc')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data[0].firstName).toBe('Alice');
      expect(res.body.data[1].firstName).toBe('Bob');
    });

    it('should support pagination', async () => {
      // Create multiple test authors
      for (let i = 0; i < 5; i++) {
        await Author.create({
          ...testAuthor,
          firstName: `Author${i}`,
          lastName: `Test${i}`
        });
      }

      const res = await request(app)
        .get('/api/authors?page=1&limit=2')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.pagination.current).toBe(1);
      expect(res.body.pagination.total).toBe(3); // 5 items / 2 per page = 3 pages
    });
  });

  describe('GET /api/authors/:id', () => {
    it('should return 404 for non-existent author', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/authors/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Author not found');
    });

    it('should return author by valid ID', async () => {
      const author = await Author.create(testAuthor);

      const res = await request(app)
        .get(`/api/authors/${author._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('John');
      expect(res.body.data.lastName).toBe('Doe');
      expect(res.body.data.nationality).toBe('American');
    });

    it('should return 404 for invalid ObjectId format', async () => {
      const res = await request(app)
        .get('/api/authors/invalid-id')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Author not found');
    });
  });

  describe('GET /api/authors/genre/:genre', () => {
    it('should return authors by genre', async () => {
      // Create test author with specific genre
      await Author.create(testAuthor); // Has 'Fiction' genre

      const res = await request(app)
        .get('/api/authors/genre/Fiction')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].genres).toContain('Fiction');
    });

    it('should return empty array for non-existent genre', async () => {
      const res = await request(app)
        .get('/api/authors/genre/NonExistentGenre')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/authors/:id/stats', () => {
    it('should return 404 for non-existent author stats', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/authors/${fakeId}/stats`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Author not found');
    });

    it('should return author statistics', async () => {
      const author = await Author.create(testAuthor);

      const res = await request(app)
        .get(`/api/authors/${author._id}/stats`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('fullName');
      expect(res.body.data).toHaveProperty('booksCount');
      expect(res.body.data).toHaveProperty('averageRating');
      expect(res.body.data).toHaveProperty('genres');
      expect(res.body.data).toHaveProperty('nationality');
    });
  });
});
