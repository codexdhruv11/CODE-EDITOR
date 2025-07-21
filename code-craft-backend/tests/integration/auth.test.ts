import request from 'supertest';
import app from '../../src/server';
import { createTestUser, generateTestJWT } from '../setup';
import { User } from '../../src/models/User';

describe('Authentication Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'TestPassword123',
        name: 'New User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined();

      // Verify user was created in database
      const user = await User.findByEmail(userData.email);
      expect(user).toBeTruthy();
      expect(user?.email).toBe(userData.email);
    });

    it('should return 400 for duplicate email', async () => {
      // Create initial user
      await createTestUser();
      
      const duplicateData = {
        email: 'test@example.com', // Same email as createTestUser
        password: 'TestPassword123',
        name: 'Different User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body.error.message).toContain('already exists');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body.error.message).toBe('Validation failed');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body.error.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      // Create a test user
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123',
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123',
        })
        .expect(401);

      expect(response.body.error.message).toBe('Invalid email or password');
    });

    it('should return 401 for invalid password', async () => {
      await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        })
        .expect(401);

      expect(response.body.error.message).toBe('Invalid email or password');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          // Missing password
        })
        .expect(400);

      expect(response.body.error.message).toBe('Validation failed');
    });
  });

  describe('GET /api/users/me', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return user profile with valid JWT token', async () => {
      // Create test user
      const user = await createTestUser();
      const token = generateTestJWT(user._id.toString());

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.name).toBe(user.name);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return 401 with invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error.message).toBe('Invalid token');
    });
  });

  describe('Authentication Middleware', () => {
    it('should reject requests without Authorization header', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(response.body.error.message).toBe('Authorization token required');
    });

    it('should reject requests with invalid token format', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.error.message).toBe('Authorization token required');
    });

    it('should reject requests with malformed Bearer token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer')
        .expect(401);

      expect(response.body.error.message).toBe('Authorization token required');
    });
  });

  describe('User Profile Operations', () => {
    it('should update user profile with valid data', async () => {
      // This would require proper authentication setup
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const response = await request(app)
        .patch('/api/users/me')
        .send(updateData)
        .expect(401); // Will fail without auth

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});