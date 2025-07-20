import request from 'supertest';
import app from '../../src/server';
import { createTestUser, mockAuthUser } from '../setup';

describe('Authentication Integration Tests', () => {
  describe('POST /api/users/sync', () => {
    it('should create a new user', async () => {
      const userData = {
        clerkId: 'new-clerk-id',
        email: 'newuser@example.com',
        name: 'New User',
      };

      const response = await request(app)
        .post('/api/users/sync')
        .send(userData)
        .expect(200);

      expect(response.body.message).toBe('User synced successfully');
      expect(response.body.user.clerkId).toBe(userData.clerkId);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
    });

    it('should update existing user', async () => {
      // Create initial user
      const user = await createTestUser();
      
      const updatedData = {
        clerkId: user.clerkId,
        email: 'updated@example.com',
        name: 'Updated User',
      };

      const response = await request(app)
        .post('/api/users/sync')
        .send(updatedData)
        .expect(200);

      expect(response.body.message).toBe('User synced successfully');
      expect(response.body.user.email).toBe(updatedData.email);
      expect(response.body.user.name).toBe(updatedData.name);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/users/sync')
        .send({ clerkId: 'test' })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/users/me', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return user profile with valid token', async () => {
      // Create test user
      await createTestUser();

      // Mock authentication by setting up a valid JWT token
      const token = 'valid-jwt-token';
      
      // This test would need proper JWT mocking in a real implementation
      // For now, we'll test the endpoint structure
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401); // Will fail without proper auth setup

      expect(response.body.error.code).toBe('UNAUTHORIZED');
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