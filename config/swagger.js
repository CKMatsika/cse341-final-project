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
        url: 'https://cse341-final-project-lcdf.onrender.com',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        },
        googleAuth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
              tokenUrl: 'https://oauth2.googleapis.com/token',
              scopes: {
                'openid': 'Open ID Connect',
                'profile': 'Access to user profile',
                'email': 'Access to user email'
              }
            }
          }
        }
      },
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
        Author: {
          type: 'object',
          required: ['firstName', 'lastName'],
          properties: {
            _id: {
              type: 'string',
              description: 'MongoDB ObjectId'
            },
            firstName: {
              type: 'string',
              maxLength: 50,
              description: 'Author first name'
            },
            lastName: {
              type: 'string',
              maxLength: 50,
              description: 'Author last name'
            },
            penName: {
              type: 'string',
              maxLength: 100,
              description: 'Author pen name or pseudonym'
            },
            bio: {
              type: 'string',
              maxLength: 2000,
              description: 'Author biography'
            },
            birthDate: {
              type: 'string',
              format: 'date',
              description: 'Author birth date'
            },
            deathDate: {
              type: 'string',
              format: 'date',
              description: 'Author death date (if applicable)'
            },
            nationality: {
              type: 'string',
              maxLength: 50,
              description: 'Author nationality'
            },
            website: {
              type: 'string',
              format: 'uri',
              description: 'Author website'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Author email'
            },
            phone: {
              type: 'string',
              description: 'Author phone'
            },
            profileImage: {
              type: 'string',
              format: 'uri',
              description: 'Author profile image'
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
              description: 'Author literary genres'
            },
            languages: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Other']
              },
              description: 'Languages author writes in'
            },
            awards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Award name'
                  },
                  year: {
                    type: 'number',
                    minimum: 1000,
                    maximum: new Date().getFullYear(),
                    description: 'Award year'
                  },
                  description: {
                    type: 'string',
                    description: 'Award description'
                  }
                }
              },
              description: 'Author literary awards'
            },
            socialMedia: {
              type: 'object',
              properties: {
                twitter: {
                  type: 'string',
                  description: 'Twitter handle'
                },
                facebook: {
                  type: 'string',
                  description: 'Facebook profile'
                },
                instagram: {
                  type: 'string',
                  description: 'Instagram handle'
                },
                linkedin: {
                  type: 'string',
                  description: 'LinkedIn profile'
                }
              }
            },
            booksPublished: {
              type: 'number',
              minimum: 0,
              description: 'Number of books published'
            },
            status: {
              type: 'string',
              enum: ['Active', 'Inactive', 'Deceased', 'Retired'],
              description: 'Author status'
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
        Review: {
          type: 'object',
          required: ['title', 'content', 'rating'],
          properties: {
            _id: {
              type: 'string',
              description: 'MongoDB ObjectId'
            },
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Review title'
            },
            content: {
              type: 'string',
              maxLength: 5000,
              description: 'Review content'
            },
            rating: {
              type: 'number',
              minimum: 1,
              maximum: 5,
              description: 'Rating (1-5 stars)'
            },
            book: {
              type: 'string',
              description: 'Book ObjectId reference'
            },
            author: {
              type: 'string',
              description: 'Author ObjectId reference'
            },
            reviewer: {
              type: 'string',
              description: 'User ObjectId reference'
            },
            helpful: {
              type: 'number',
              minimum: 0,
              description: 'Number of helpful votes'
            },
            status: {
              type: 'string',
              enum: ['Published', 'Pending', 'Hidden', 'Flagged'],
              description: 'Review status'
            },
            moderatedBy: {
              type: 'string',
              description: 'User ObjectId of moderator'
            },
            moderatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Moderation timestamp'
            },
            moderationReason: {
              type: 'string',
              maxLength: 500,
              description: 'Reason for moderation'
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
        User: {
          type: 'object',
          required: ['googleId', 'email', 'name'],
          properties: {
            _id: {
              type: 'string',
              description: 'MongoDB ObjectId'
            },
            googleId: {
              type: 'string',
              description: 'Google OAuth ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            name: {
              type: 'string',
              maxLength: 100,
              description: 'User display name'
            },
            picture: {
              type: 'string',
              format: 'uri',
              description: 'User profile picture'
            },
            role: {
              type: 'string',
              enum: ['reader', 'author', 'admin'],
              description: 'User role'
            },
            isActive: {
              type: 'boolean',
              description: 'Account status'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp'
            },
            preferences: {
              type: 'object',
              properties: {
                theme: {
                  type: 'string',
                  enum: ['light', 'dark']
                },
                language: {
                  type: 'string',
                  enum: ['en', 'es', 'fr', 'de', 'it', 'pt']
                },
                notifications: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'boolean'
                    },
                    push: {
                      type: 'boolean'
                    }
                  }
                }
              }
            },
            favorites: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Favorite book IDs'
            },
            readingHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  book: {
                    type: 'string'
                  },
                  status: {
                    type: 'string',
                    enum: ['want_to_read', 'currently_reading', 'read']
                  },
                  progress: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100
                  },
                  startedAt: {
                    type: 'string',
                    format: 'date-time'
                  },
                  finishedAt: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              },
              description: 'User reading history'
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
