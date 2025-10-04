# Literary Database API

A comprehensive REST API for managing authors, books, publishers, and literary content. Built with Node.js, Express, and MongoDB.

## Features

- **Book Management**: Full CRUD operations for books with advanced search and filtering
- **Publisher Management**: Complete publisher profiles with imprint management
- **API Documentation**: Interactive Swagger documentation
- **Error Handling**: Comprehensive error handling and validation
- **Security**: CORS configuration and input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Documentation**: Swagger/OpenAPI
- **Validation**: Joi
- **Security**: Helmet, CORS

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd literary-database-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/literary-database?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start MongoDB** (if using local MongoDB)
   ```bash
   mongod
   ```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Books
- `GET /api/books` - Get all books (with pagination, search, filtering)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `GET /api/books/author/:authorId` - Get books by author

### Publishers
- `GET /api/publishers` - Get all publishers (with pagination, filtering)
- `GET /api/publishers/:id` - Get publisher by ID
- `POST /api/publishers` - Create new publisher
- `PUT /api/publishers/:id` - Update publisher
- `DELETE /api/publishers/:id` - Delete publisher
- `GET /api/publishers/genre/:genre` - Get publishers by genre
- `GET /api/publishers/:id/books` - Get publisher's books

### Utility
- `GET /health` - Health check
- `GET /api-docs` - API documentation (Swagger)

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running.

## Project Structure

```
literary-database-api/
├── config/                 # Configuration files
│   └── database.js        # MongoDB connection
├── controllers/           # Route controllers
│   ├── books.js          # Book operations
│   └── publishers.js     # Publisher operations
├── middleware/            # Custom middleware
│   ├── errorHandler.js   # Global error handling
│   └── validation.js     # Input validation
├── models/               # MongoDB schemas
│   ├── Book.js          # Book model
│   └── Publisher.js     # Publisher model
├── routes/               # API routes
│   ├── books.js         # Book routes
│   └── publishers.js    # Publisher routes
├── utils/               # Utility functions
│   └── validators.js    # Joi validation schemas
├── .env                 # Environment variables
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── server.js           # Application entry point
└── README.md           # Project documentation
```

## Data Models

### Book Schema
- `title` (required) - Book title
- `isbn` - International Standard Book Number
- `description` - Book description
- `author` (required) - Author reference
- `publisher` - Publisher reference
- `publicationDate` (required) - Publication date
- `genre` - Array of book genres
- `language` - Book language
- `pages` - Number of pages
- `format` - Book format (Hardcover, Paperback, E-book, Audiobook)
- `price` - Book price
- `coverImage` - Cover image URL
- `tags` - Array of tags
- `averageRating` - Average rating (0-5)
- `ratingCount` - Number of ratings
- `status` - Publication status

### Publisher Schema
- `name` (required) - Publisher name
- `description` - Publisher description
- `foundedYear` - Year founded
- `headquarters` - City and country
- `website` - Publisher website
- `email` - Contact email
- `phone` - Contact phone
- `logo` - Logo URL
- `genres` - Array of genres
- `imprint` - Array of imprints
- `status` - Publisher status
- `socialMedia` - Social media links
- `booksPublished` - Number of books published

## Validation

All input data is validated using Joi schemas:
- Required fields validation
- Data type validation
- String length limits
- Email format validation
- URL format validation
- Custom business logic validation

## Error Handling

Comprehensive error handling includes:
- Validation errors with detailed messages
- MongoDB errors (duplicate keys, cast errors)
- JWT authentication errors
- Generic server errors with proper HTTP status codes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if necessary
5. Submit a pull request

## License

This project is licensed under the MIT License.
