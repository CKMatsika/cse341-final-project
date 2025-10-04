const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Literary Database API',
      version: '1.0.0',
      description: 'A comprehensive API for managing authors, books, publishers, and literary content',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://cse341-code-student.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        Book: {
          type: 'object',
          required: ['title', 'author', 'publicationDate'],
          properties: {
            _id: {
              type: 'string',
              description: 'MongoDB ObjectId'
            },
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Book title'
            },
            isbn: {
              type: 'string',
              description: 'International Standard Book Number'
            },
            description: {
              type: 'string',
              maxLength: 2000,
              description: 'Book description'
            },
            author: {
              type: 'string',
              description: 'Author ObjectId reference'
            },
            publisher: {
              type: 'string',
              description: 'Publisher ObjectId reference'
            },
            publicationDate: {
              type: 'string',
              format: 'date',
              description: 'Publication date'
            },
            genre: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
                  'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
                  'Drama', 'Thriller', 'Horror', 'Children', 'Young Adult',
                  'Philosophy', 'Science', 'Technology', 'Other'
                ]
              },
              description: 'Book genres'
            },
            language: {
              type: 'string',
              enum: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Other'],
              description: 'Book language'
            },
            pages: {
              type: 'number',
              minimum: 1,
              description: 'Number of pages'
            },
            format: {
              type: 'string',
              enum: ['Hardcover', 'Paperback', 'E-book', 'Audiobook'],
              description: 'Book format'
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Book price'
            },
            coverImage: {
              type: 'string',
              format: 'uri',
              description: 'Cover image URL'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Book tags'
            },
            averageRating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'Average rating'
            },
            ratingCount: {
              type: 'number',
              minimum: 0,
              description: 'Number of ratings'
            },
            status: {
              type: 'string',
              enum: ['Published', 'Upcoming', 'Out of Print', 'Cancelled'],
              description: 'Publication status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Publisher: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'MongoDB ObjectId'
            },
            name: {
              type: 'string',
              maxLength: 100,
              description: 'Publisher name'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Publisher description'
            },
            foundedYear: {
              type: 'number',
              minimum: 1400,
              maximum: new Date().getFullYear(),
              description: 'Year publisher was founded'
            },
            headquarters: {
              type: 'object',
              properties: {
                city: {
                  type: 'string',
                  maxLength: 50
                },
                country: {
                  type: 'string',
                  maxLength: 50
                }
              }
            },
            website: {
              type: 'string',
              format: 'uri',
              description: 'Publisher website'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Contact email'
            },
            phone: {
              type: 'string',
              description: 'Contact phone'
            },
            logo: {
              type: 'string',
              format: 'uri',
              description: 'Publisher logo URL'
            },
            genres: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
                  'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
                  'Drama', 'Thriller', 'Horror', 'Children', 'Young Adult',
                  'Philosophy', 'Science', 'Technology', 'Academic', 'Other'
                ]
              },
              description: 'Publisher genres'
            },
            imprint: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  description: {
                    type: 'string'
                  }
                }
              },
              description: 'Publisher imprints'
            },
            status: {
              type: 'string',
              enum: ['Active', 'Inactive', 'Acquired', 'Defunct'],
              description: 'Publisher status'
            },
            socialMedia: {
              type: 'object',
              properties: {
                twitter: {
                  type: 'string'
                },
                facebook: {
                  type: 'string'
                },
                instagram: {
                  type: 'string'
                },
                linkedin: {
                  type: 'string'
                }
              }
            },
            booksPublished: {
              type: 'number',
              minimum: 0,
              description: 'Number of books published'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
