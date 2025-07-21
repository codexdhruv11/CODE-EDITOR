import request from 'supertest';
import app from '../../src/server';
import { User } from '../../src/models';
import { connectTestDatabase, clearTestDatabase, closeTestDatabase } from '../setup';

describe('Authentication Flow Integration Tests', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('Complete Registration Flow', () => {
    const validUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(validUserData.email);
      expect(response.body.user.name).toBe(validUserData.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should prevent duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(400);

      expect(response.body.error.message).toContain('already exists');
    });

    it('should validate password requirements', async () => {
      const weakPassword = { ...validUserData, password: '123' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPassword)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Complete Login Flow', () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123',
    };

    beforeEach(async () => {
      // Create user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.error.message).toContain('Invalid email or password');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userData.password,
        })
        .expect(401);

      expect(response.body.error.message).toContain('Invalid email or password');
    });
  });

  describe('Protected Route Access', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      // Register and login to get token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPassword123',
        });

      authToken = registerResponse.body.token;
      userId = registerResponse.body.user._id;
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user._id).toBe(userId);
    });

    it('should reject access without token', async () => {
      await request(app)
        .get('/api/users/me')
        .expect(401);
    });

    it('should reject access with invalid token', async () => {
      await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject access with malformed authorization header', async () => {
      await request(app)
        .get('/api/users/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on auth endpoints', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Make multiple failed login attempts
      const promises = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send(userData)
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('JWT Token Validation', () => {
    let authToken: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPassword123',
        });

      authToken = response.body.token;
    });

    it('should validate JWT token structure', () => {
      expect(authToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    it('should include user ID in token payload', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user._id).toBeDefined();
    });
  });
});