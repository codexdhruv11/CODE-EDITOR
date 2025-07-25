# SnippetLab Backend

A modern MERN stack backend for SnippetLab - A free code editor and snippet sharing platform.

## 🚀 Features

- **Code Execution**: Execute code in 10+ programming languages using Piston API
- **Snippet Management**: Create, share, and manage code snippets
- **Social Features**: Comments and stars system for snippets
- **User Profiles**: User statistics and execution history
- **No Premium Restrictions**: All features are free for authenticated users
- **Modern Architecture**: Built with Express.js, MongoDB, and TypeScript

## 🛠 Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Language**: TypeScript
- **Authentication**: Clerk (or custom JWT)
- **Code Execution**: Piston API
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting

## 📋 Supported Languages

All languages are available to all authenticated users (no premium restrictions):

- JavaScript
- TypeScript  
- Python
- Java
- Go
- Rust
- C++
- C#
- Ruby
- Swift

## 🏗 Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # MongoDB connection
│   └── env.ts       # Environment variables
├── controllers/     # Route controllers
│   ├── userController.ts
│   ├── snippetController.ts
│   ├── commentController.ts
│   ├── starController.ts
│   └── executionController.ts
├── middleware/      # Express middleware
│   ├── auth.ts      # Authentication
│   ├── validation.ts # Input validation
│   ├── rateLimiting.ts # Rate limiting
│   └── errorHandler.ts # Error handling
├── models/          # MongoDB models
│   ├── User.ts
│   ├── Snippet.ts
│   ├── CodeExecution.ts
│   ├── SnippetComment.ts
│   └── Star.ts
├── routes/          # API routes
│   ├── userRoutes.ts
│   ├── snippetRoutes.ts
│   ├── commentRoutes.ts
│   ├── starRoutes.ts
│   ├── executionRoutes.ts
│   ├── webhookRoutes.ts
│   └── index.ts
├── services/        # Business logic
│   └── codeExecution.ts
├── utils/           # Utilities
│   ├── constants.ts
│   ├── logger.ts
│   └── pagination.ts
└── server.ts        # Main server file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd snippetlab-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/snippetlab
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud database

5. **Run the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

### Production Build

```bash
npm run build
npm start
```

## 📚 API Documentation

Visit `http://localhost:3001/api/docs` for complete API documentation.

### Key Endpoints

- **Health Check**: `GET /api/health`
- **Code Execution**: `POST /api/executions`
- **Snippets**: `GET /api/snippets`, `POST /api/snippets`
- **Comments**: `POST /api/comments/snippets/:id/comments`
- **Stars**: `POST /api/stars/snippets/:id/stars`
- **Languages**: `GET /api/executions/languages`

### Authentication

Include the authorization header in requests:
```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security Features

- **Rate Limiting**: Different limits for different endpoints
- **Input Validation**: Comprehensive validation using express-validator
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Authentication**: JWT token verification
- **HTML Sanitization**: Prevents XSS in comments

## 📊 Rate Limits

- **General API**: 100 requests/minute per IP
- **Code Execution**: 10 requests/minute per user
- **Snippet Creation**: 5 requests/minute per user
- **Comments**: 20 requests/minute per user
- **Stars**: 30 requests/minute per user

## 🔄 Migration from Convex

This backend replaces the original Convex serverless backend with key changes:

### Removed Features
- ❌ Premium/Pro user restrictions
- ❌ Payment integration (Lemon Squeezy)
- ❌ Language restrictions for non-JavaScript languages
- ❌ Subscription management

### New Features
- ✅ All languages free for all authenticated users
- ✅ RESTful API design
- ✅ Comprehensive rate limiting
- ✅ Enhanced error handling
- ✅ Detailed logging
- ✅ API documentation

### Data Migration
When migrating from Convex:
1. Export user data (remove premium fields)
2. Export snippets and comments
3. Export execution history
4. Import to MongoDB using provided models

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/code-craft
CLERK_SECRET_KEY=your_production_clerk_key
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=warn
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### Health Checks

The API provides health check endpoints:
- `GET /api/health` - Basic health check
- `GET /api/webhooks/health` - Webhook service health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the API documentation at `/api/docs`
2. Review the logs for error details
3. Check rate limiting if requests are failing
4. Ensure all environment variables are set correctly

## 🎯 Key Principles

- **Free for All**: No premium restrictions on any features
- **Security First**: Comprehensive security measures
- **Performance**: Optimized database queries and caching
- **Scalability**: Designed to handle growth
- **Developer Experience**: Clear API design and documentation