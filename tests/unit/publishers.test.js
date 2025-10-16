const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Publisher = require('../../models/Publisher');

// Test data
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

describe('Publishers API - GET Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/literary-test');
  });

  afterAll(async () => {
    // Clean up test database
    await Publisher.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear publishers collection before each test
    await Publisher.deleteMany({});
  });

  describe('GET /api/publishers', () => {
    it('should return empty array when no publishers exist', async () => {
      const res = await request(app)
        .get('/api/publishers')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination).toBeDefined();
    });

    it('should return all publishers when they exist', async () => {
      // Create test publishers
      await Publisher.create(testPublisher);
      await Publisher.create({
        ...testPublisher,
        name: 'Another Publisher',
        foundedYear: 1995
      });

      const res = await request(app)
        .get('/api/publishers')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('foundedYear');
    });

    it('should support search query parameter', async () => {
      // Create test publisher
      await Publisher.create(testPublisher);

      const res = await request(app)
        .get('/api/publishers?search=Test')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toContain('Test');
    });

    it('should support genre filtering', async () => {
      // Create test publishers with different genres
      await Publisher.create(testPublisher); // Has 'Fiction', 'Mystery'
      await Publisher.create({
        ...testPublisher,
        name: 'Romance Publisher',
        genres: ['Romance', 'Drama']
      });

      const res = await request(app)
        .get('/api/publishers?genre=Fiction')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].genres).toContain('Fiction');
    });

    it('should support status filtering', async () => {
      // Create test publishers with different statuses
      await Publisher.create(testPublisher); // Active
      await Publisher.create({
        ...testPublisher,
        name: 'Inactive Publisher',
        status: 'Inactive'
      });

      const res = await request(app)
        .get('/api/publishers?status=Active')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].status).toBe('Active');
    });

    it('should support founded year filtering', async () => {
      // Create test publishers with different founded years
      await Publisher.create(testPublisher); // 2000
      await Publisher.create({
        ...testPublisher,
        name: 'Old Publisher',
        foundedYear: 1950
      });

      const res = await request(app)
        .get('/api/publishers?foundedAfter=1960')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].foundedYear).toBe(2000);
    });

    it('should support sorting', async () => {
      // Create test publishers
      await Publisher.create({ ...testPublisher, name: 'Z Publisher' });
      await Publisher.create({ ...testPublisher, name: 'A Publisher' });

      const res = await request(app)
        .get('/api/publishers?sortBy=name&sortOrder=asc')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data[0].name).toBe('A Publisher');
      expect(res.body.data[1].name).toBe('Z Publisher');
    });

    it('should support pagination', async () => {
      // Create multiple test publishers
      for (let i = 0; i < 5; i++) {
        await Publisher.create({
          ...testPublisher,
          name: `Test Publisher ${i}`
        });
      }

      const res = await request(app)
        .get('/api/publishers?page=1&limit=2')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.pagination.current).toBe(1);
      expect(res.body.pagination.total).toBe(3); // 5 items / 2 per page = 3 pages
    });
  });

  describe('GET /api/publishers/:id', () => {
    it('should return 404 for non-existent publisher', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/publishers/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Publisher not found');
    });

    it('should return publisher by valid ID', async () => {
      const publisher = await Publisher.create(testPublisher);

      const res = await request(app)
        .get(`/api/publishers/${publisher._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Publisher');
      expect(res.body.data.foundedYear).toBe(2000);
      expect(res.body.data.status).toBe('Active');
    });

    it('should return 404 for invalid ObjectId format', async () => {
      const res = await request(app)
        .get('/api/publishers/invalid-id')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Publisher not found');
    });
  });
});
