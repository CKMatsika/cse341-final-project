const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
require('express-async-errors');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const bookRoutes = require('./routes/books');
const publisherRoutes = require('./routes/publishers');
const authorRoutes = require('./routes/authors');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require('./routes/auth');

// Import auth configuration
require('./config/auth');

// Import Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS ?
      process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Literary Database API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Literary Database API Documentation'
}));

// API routes
app.use('/api/books', bookRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/auth', authRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Literary Database API',
    version: '1.0.0',
    endpoints: {
      books: '/api/books',
      publishers: '/api/publishers',
      authors: '/api/authors',
      reviews: '/api/reviews',
      authentication: '/auth',
      documentation: '/api-docs',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Literary Database API Server Started!
📚 Server running in ${process.env.NODE_ENV || 'development'} mode
🌐 Server: http://localhost:${PORT}
📖 API Documentation: http://localhost:${PORT}/api-docs
🏥 Health Check: http://localhost:${PORT}/health
📚 Books API: http://localhost:${PORT}/api/books
🏢 Publishers API: http://localhost:${PORT}/api/publishers
👨‍💻 Authors API: http://localhost:${PORT}/api/authors
⭐ Reviews API: http://localhost:${PORT}/api/reviews
🔐 Authentication: http://localhost:${PORT}/auth
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
