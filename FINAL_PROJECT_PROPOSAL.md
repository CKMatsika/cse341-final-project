# CSE 341 Final Project Proposal

## General Info

**Student Names in group:** [Your Team Member Names]
**Proposed Application Name:** Literary Database API

## Application Info

### What will the API do?
The Literary Database API will be a comprehensive backend system for managing authors, books, publishers, and literary content. Building upon our existing Authors and Contacts API, this expanded system will provide a complete platform for:

- **Author Management:** Create, read, update, and delete author profiles with detailed information including bio, genres, contact details, and publication history
- **Book/Content Management:** Manage books, articles, and other literary works with metadata, categories, and relationships to authors
- **Publisher Management:** Track publishers, imprints, and publishing contracts
- **Review & Rating System:** Allow authenticated users to review and rate books and authors
- **Search & Discovery:** Advanced search and filtering capabilities across all content
- **User Management:** OAuth-based authentication system for different user roles (readers, authors, administrators)

The API will serve as the backend for a potential frontend application (web/mobile) for literary enthusiasts, researchers, or publishing professionals.

### How will your API utilize a login system?
The API will implement a comprehensive OAuth 2.0 authentication system using Google OAuth:

- **Authentication Flow:** Users authenticate via Google OAuth 2.0
- **JWT Token Management:** Generate and validate JWT tokens for API access
- **Role-Based Access Control (RBAC):** Different permissions for readers, authors, and administrators
- **Session Management:** Secure session handling with configurable expiration
- **Passwordless Authentication:** Primary authentication through OAuth providers
- **Token Refresh:** Automatic token refresh mechanisms for seamless user experience

Protected routes will require Bearer token authentication in the Authorization header.

### What database will you use?
**MongoDB Atlas** - We will continue using MongoDB Atlas for the following reasons:

- **Scalability:** Cloud-based solution that can handle growth
- **Flexibility:** Schema-less design perfect for evolving literary data structures
- **Geographic Distribution:** Multiple regions for global access
- **Built-in Security:** Authentication, encryption, and compliance features
- **Integration:** Seamless integration with Node.js/Mongoose ODM

### How will the data be stored in your database?
The database will utilize multiple collections with relationships:

**Authors Collection:**
- Personal information (name, bio, contact details)
- Professional data (genres, pen names, nationality)
- Publication history and statistics
- Social media and website links
- Timestamps for creation and updates

**Books Collection:**
- Book metadata (title, ISBN, publication date)
- Author relationships (primary author, contributors)
- Publisher information
- Genre classifications and tags
- Physical/digital format specifications
- Pricing and availability data

**Publishers Collection:**
- Company information and contact details
- Publication history and specializations
- Contract templates and terms
- Distribution channels and regions
- Financial and statistical data

**Reviews Collection:**
- User-generated content and ratings
- Book and author associations
- Moderation status and flags
- Helpful votes and engagement metrics

**Users Collection:**
- OAuth provider information
- Profile data and preferences
- Reading history and favorites
- Role assignments and permissions

All collections will use MongoDB's native `_id` fields for relationships, with additional indexing for performance optimization.

### How would a frontend be able to manage authentication state based on the data you provide?
The API will provide comprehensive authentication endpoints and data structures:

**Authentication Endpoints:**
- `POST /auth/google` - Initiate OAuth flow
- `GET /auth/google/callback` - Handle OAuth callback
- `POST /auth/refresh` - Refresh JWT tokens
- `POST /auth/logout` - Invalidate user sessions

**User Data Endpoints:**
- `GET /api/users/profile` - Retrieve current user profile
- `PUT /api/users/profile` - Update user preferences
- `GET /api/users/{id}/reading-history` - Get user's reading history
- `POST /api/users/{id}/favorites` - Add books to favorites

**Frontend Integration:**
- JWT tokens stored in localStorage/sessionStorage
- Automatic token refresh before expiration
- Role-based UI rendering based on user permissions
- Real-time authentication state management
- Secure API calls with Authorization headers

### What pieces of data in your app will need to be secured? How will you demonstrate web security principles in the development of this app?
**Secured Data Elements:**
- User authentication tokens and session data
- Personal user information (email, profiles)
- Administrative functions and user management
- Financial data (if pricing information is sensitive)
- Moderation and content management tools

**Security Implementation:**

**Authentication & Authorization:**
- OAuth 2.0 implementation with PKCE
- JWT tokens with short expiration times
- Secure token storage and transmission
- Role-based access control (RBAC)

**Data Protection:**
- Input validation and sanitization
- SQL injection prevention (MongoDB parameterized queries)
- XSS protection through data sanitization
- CSRF protection for state-changing operations
- Rate limiting on API endpoints

**API Security:**
- HTTPS enforcement in production
- CORS configuration for authorized domains
- API versioning for backward compatibility
- Comprehensive error handling without data leaks
- Request/response logging for audit trails

**Database Security:**
- MongoDB Atlas encryption at rest
- Network access restrictions
- Database user privilege minimization
- Regular security updates and patches

**Operational Security:**
- Environment variable management for secrets
- Secure deployment practices
- Regular dependency updates
- Security headers (helmet.js implementation)

### What file structure and program architecture will you use for this project (how will you organize your node project)? Why?
```
literary-database-api/
├── config/                 # Configuration files
│   ├── auth.js            # OAuth configuration
│   ├── database.js        # Database connection setup
│   └── swagger.js         # API documentation config
├── controllers/           # Route controllers (business logic)
│   ├── authors.js         # Author-related operations
│   ├── books.js           # Book management logic
│   ├── publishers.js      # Publisher operations
│   ├── reviews.js         # Review and rating logic
│   └── users.js           # User management
├── middleware/            # Custom middleware
│   ├── auth.js           # Authentication middleware
│   ├── validation.js     # Input validation
│   ├── rateLimit.js      # API rate limiting
│   └── errorHandler.js   # Global error handling
├── models/               # MongoDB schemas
│   ├── Author.js         # Author model (existing)
│   ├── Book.js           # Book model (new)
│   ├── Publisher.js      # Publisher model (new)
│   ├── Review.js         # Review model (new)
│   └── User.js           # User model (new)
├── routes/               # API route definitions
│   ├── authors.js        # Author routes (existing)
│   ├── books.js          # Book routes (new)
│   ├── publishers.js     # Publisher routes (new)
│   ├── reviews.js        # Review routes (new)
│   ├── users.js          # User routes (new)
│   └── index.js          # Route aggregation
├── utils/                # Utility functions
│   ├── validators.js     # Validation helpers
│   ├── formatters.js     # Data formatting utilities
│   └── constants.js      # Application constants
├── .env                  # Environment variables
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── server.js            # Application entry point
├── package.json         # Dependencies and scripts
└── README.md           # Project documentation
```

**Architecture Rationale:**
- **Separation of Concerns:** Clear separation between routes, controllers, models, and middleware
- **Modularity:** Each feature has its own dedicated files for maintainability
- **Scalability:** Structure supports easy addition of new features
- **Industry Standards:** Follows common Node.js/Express patterns
- **Testing Ready:** Structure supports unit and integration testing

### What are potential stretch challenges that you could implement to go above and beyond?
**Advanced Features:**
1. **Elasticsearch Integration** - Full-text search capabilities across all content
2. **Redis Caching** - Performance optimization for frequently accessed data
3. **File Upload System** - Author photos, book covers, and document storage
4. **Real-time Features** - WebSocket implementation for live updates
5. **API Analytics** - Usage tracking and performance monitoring
6. **Internationalization** - Multi-language support for global users
7. **Advanced Filtering** - Complex query building with aggregation pipeline
8. **Recommendation Engine** - ML-based book/author recommendations
9. **Social Features** - Following authors, reading groups, discussions
10. **Mobile API Optimization** - Dedicated endpoints for mobile apps

**Technical Enhancements:**
1. **GraphQL API** - Alternative query interface
2. **Docker Containerization** - Complete containerized deployment
3. **CI/CD Pipeline** - Automated testing and deployment
4. **Performance Monitoring** - Application performance monitoring (APM)
5. **Load Testing** - Comprehensive load and stress testing

## API Endpoint Planning

**Authors Endpoints:**
- `GET /api/authors` - List all authors (paginated, filtered)
- `GET /api/authors/search` - Search authors by name, genre, nationality
- `GET /api/authors/{id}` - Get specific author details
- `POST /api/authors` - Create new author (admin only)
- `PUT /api/authors/{id}` - Update author information
- `DELETE /api/authors/{id}` - Delete author (admin only)
- `GET /api/authors/{id}/books` - Get author's books
- `POST /api/authors/{id}/photo` - Upload author photo

**Books Endpoints:**
- `GET /api/books` - List all books (paginated, filtered, sorted)
- `GET /api/books/search` - Advanced search with filters
- `GET /api/books/{id}` - Get specific book details
- `POST /api/books` - Add new book (authenticated users)
- `PUT /api/books/{id}` - Update book information
- `DELETE /api/books/{id}` - Delete book (admin/author only)
- `GET /api/books/{id}/reviews` - Get book reviews
- `POST /api/books/{id}/reviews` - Add book review

**Publishers Endpoints:**
- `GET /api/publishers` - List all publishers
- `GET /api/publishers/{id}` - Get publisher details
- `POST /api/publishers` - Create publisher (admin only)
- `PUT /api/publishers/{id}` - Update publisher
- `DELETE /api/publishers/{id}` - Delete publisher (admin only)
- `GET /api/publishers/{id}/books` - Get publisher's books

**Reviews Endpoints:**
- `GET /api/reviews` - List all reviews (moderated content)
- `GET /api/reviews/{id}` - Get specific review
- `POST /api/reviews` - Create new review (authenticated users)
- `PUT /api/reviews/{id}` - Update own review
- `DELETE /api/reviews/{id}` - Delete own review
- `POST /api/reviews/{id}/helpful` - Mark review as helpful

**Users Endpoints:**
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/{id}/favorites` - Get user's favorite books
- `POST /api/users/{id}/favorites` - Add to favorites
- `DELETE /api/users/{id}/favorites/{bookId}` - Remove from favorites

**Authentication Endpoints:**
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback handler
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh JWT token

## Project Scheduling and Delegation

**Week 04 Tasks** ✅ *Project Proposal*
- Finalize project scope and technical requirements
- Design database schema and relationships
- Plan API architecture and security measures

**Week 05 Tasks**
- Set up project repository and initial structure
- Implement core database models (Books, Publishers, Reviews, Users)
- Set up authentication system with OAuth
- Deploy initial version to Heroku/Render
- Complete API documentation with Swagger

**Week 06 Tasks**
- Implement Authors module (enhance existing CRUD)
- Implement Books module with full CRUD operations
- Implement Publishers module
- Implement Reviews and rating system
- Add advanced search and filtering capabilities

**Week 07 Tasks**
- Implement user management and profiles
- Add favorites and reading history features
- Implement comprehensive validation and error handling
- Performance optimization and caching
- Final testing and bug fixes
- Video presentation of complete system

### How will you divide up work in your team to ensure the following tasks all get completed?

**Team Member 1 (Backend Lead):**
- Core API architecture and database design
- Authentication and security implementation
- Authors and Books modules development
- API documentation and testing

**Team Member 2 (Database & API Specialist):**
- Publishers and Reviews modules
- Advanced search and filtering features
- Database optimization and indexing
- Integration testing and validation

**Team Member 3 (Frontend & UX Specialist):**
- User management and profile features
- Favorites and social features
- API testing from frontend perspective
- Documentation and presentation materials

**Team Member 4 (DevOps & Quality):**
- Deployment configuration and environment setup
- Performance monitoring and optimization
- Security auditing and compliance
- Final quality assurance and testing

**All Team Members:**
- Regular code reviews and pair programming
- Documentation updates and API testing
- Weekly stand-ups and progress tracking
- Final presentation preparation

## Potential Risks and Risk Mitigation Techniques

### What are the risks involved with you being able to finish this project in a timely manner?

**Technical Risks:**
1. **OAuth Integration Complexity** - OAuth implementation might be more complex than anticipated
2. **Database Relationship Management** - Complex relationships between collections could cause performance issues
3. **API Security Implementation** - Ensuring proper security measures without breaking functionality
4. **Third-party Service Dependencies** - Reliance on MongoDB Atlas, OAuth providers, deployment platforms

**Team Dynamics Risks:**
1. **Coordination Challenges** - Team members working across different time zones or schedules
2. **Skill Level Variations** - Different experience levels with required technologies
3. **Communication Gaps** - Misunderstandings about requirements or implementation details

**Project Management Risks:**
1. **Scope Creep** - Adding too many features beyond the core requirements
2. **Time Estimation Errors** - Underestimating time for complex features
3. **External Dependencies** - Waiting for approvals, credentials, or third-party services

### How will you mitigate or overcome these risks?

**Technical Risk Mitigation:**
1. **OAuth Integration** - Start with simplified authentication, add complexity incrementally
2. **Database Performance** - Implement proper indexing, use aggregation pipeline for complex queries
3. **Security** - Use established libraries (Passport.js, JWT), follow OWASP guidelines
4. **Dependencies** - Set up accounts and test connections early, have backup plans

**Team Dynamics Mitigation:**
1. **Coordination** - Establish regular check-in meetings, use project management tools
2. **Skill Gaps** - Pair programming, code reviews, and knowledge sharing sessions
3. **Communication** - Use clear documentation, issue tracking, and regular updates

**Project Management Mitigation:**
1. **Scope Control** - Prioritize MVP features, use feature flags for stretch goals
2. **Time Management** - Break tasks into smaller milestones, regular progress tracking
3. **Dependencies** - Identify and address external dependencies in week 1, have contingency plans

**Contingency Planning:**
- **Fallback Options:** Have alternative approaches for critical features
- **Regular Reviews:** Weekly assessment of progress and risk status
- **Resource Allocation:** Reallocate team members if someone falls behind
- **Early Testing:** Implement continuous integration and testing
- **Documentation:** Maintain comprehensive documentation for handoffs

**Success Metrics:**
- Complete all core API endpoints by end of week 6
- Achieve 90%+ test coverage for critical paths
- Successfully deploy to production environment
- Receive positive feedback on functionality and documentation
- Complete video presentation demonstrating all features
