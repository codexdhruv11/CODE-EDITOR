import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from '../src/config/env';

// Mock external services
jest.mock('../src/services/codeExecution', () => ({
  codeExecutionService: {
    executeCode: jest.fn(),
    getSupportedLanguages: jest.fn(),
    validateLanguage: jest.fn(),
    getLanguageConfig: jest.fn(),
  },
}));

// Mock logger to reduce noise in tests
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  requestLogger: jest.fn((req, res, next) => next()),
}));

// Mock Piston API
jest.mock('axios', () => ({
  post: jest.fn(),
  isAxiosError: jest.fn(),
}));

let mongoServer: MongoMemoryServer;

// Global test setup
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Global test teardown
afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Stop the in-memory MongoDB instance
  await mongoServer.stop();
});

// Test utilities
export const createTestUser = async () => {
  const { User } = await import('../src/models/User');
  return User.create({
    clerkId: 'test-clerk-id',
    email: 'test@example.com',
    name: 'Test User',
  });
};

export const createTestSnippet = async (userId: string) => {
  const { Snippet } = await import('../src/models/Snippet');
  return Snippet.create({
    userId,
    title: 'Test Snippet',
    language: 'javascript',
    code: 'console.log("Hello, World!");',
    userName: 'Test User',
  });
};

export const createTestComment = async (snippetId: string, userId: string) => {
  const { SnippetComment } = await import('../src/models/SnippetComment');
  return SnippetComment.create({
    snippetId,
    userId,
    userName: 'Test User',
    content: 'This is a test comment',
  });
};

export const createTestExecution = async (userId: string) => {
  const { CodeExecution } = await import('../src/models/CodeExecution');
  return CodeExecution.create({
    userId,
    language: 'javascript',
    code: 'console.log("Hello");',
    output: 'Hello',
    executionTime: 100,
  });
};

export const mockAuthUser = {
  id: 'test-user-id',
  clerkId: 'test-clerk-id',
  email: 'test@example.com',
  name: 'Test User',
};

// Mock authentication middleware
export const mockAuth = (req: any, res: any, next: any) => {
  req.user = mockAuthUser;
  next();
};

// Mock Piston API responses
export const mockPistonSuccess = {
  language: 'javascript',
  version: '18.15.0',
  run: {
    stdout: 'Hello, World!\n',
    stderr: '',
    code: 0,
    signal: null,
    output: 'Hello, World!\n',
  },
};

export const mockPistonError = {
  language: 'javascript',
  version: '18.15.0',
  run: {
    stdout: '',
    stderr: 'SyntaxError: Unexpected token',
    code: 1,
    signal: null,
    output: 'SyntaxError: Unexpected token',
  },
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';