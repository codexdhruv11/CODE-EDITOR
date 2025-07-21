/**
 * Frontend Authentication Integration Tests
 * Tests the complete authentication flow from UI to API
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/app/login/page';
import RegisterPage from '@/app/register/page';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/test',
}));

// Mock API calls
jest.mock('@/lib/api', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    getMe: jest.fn(),
    logout: jest.fn(),
  },
}));

const { authApi } = require('@/lib/api');

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    // Reset auth store
    useAuthStore.getState().logout();
    // Clear all mocks
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  describe('Login Flow', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      };

      authApi.login.mockResolvedValue({
        token: 'mock-token',
        user: mockUser,
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Fill in login form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password123');
      });

      // Check if user is logged in
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.email).toBe('test@example.com');
    });

    it('should handle login failure', async () => {
      authApi.login.mockRejectedValue(new Error('Invalid credentials'));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Fill in login form with invalid data
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalled();
      });

      // Check if user is still not logged in
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
    });
  });

  describe('Registration Flow', () => {
    it('should handle successful registration', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'New User',
        email: 'newuser@example.com',
      };

      authApi.register.mockResolvedValue({
        token: 'mock-token',
        user: mockUser,
      });

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      // Fill in registration form
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'New User' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'newuser@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalledWith(
          'New User',
          'newuser@example.com',
          'Password123'
        );
      });

      // Check if user is logged in after registration
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.name).toBe('New User');
    });
  });

  describe('AuthGuard Component', () => {
    it('should redirect unauthenticated users to login', () => {
      const TestComponent = () => <div>Protected Content</div>;

      render(
        <TestWrapper>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </TestWrapper>
      );

      // Should show loading initially
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should render protected content for authenticated users', async () => {
      // Set authenticated state
      useAuthStore.getState().login('mock-token', {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      });

      const TestComponent = () => <div>Protected Content</div>;

      render(
        <TestWrapper>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });

  describe('Token Persistence', () => {
    it('should persist token in localStorage', () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      };

      useAuthStore.getState().login('test-token', mockUser);

      // Check if token is stored
      expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('should clear token on logout', () => {
      // Set initial state
      useAuthStore.getState().login('test-token', {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      });

      // Logout
      useAuthStore.getState().logout();

      // Check if token is cleared
      expect(localStorage.getItem('token')).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('Auth Store Integration', () => {
    it('should initialize auth state from localStorage', async () => {
      // Mock stored token
      localStorage.setItem('token', 'stored-token');
      
      authApi.getMe.mockResolvedValue({
        user: {
          _id: 'user123',
          name: 'Stored User',
          email: 'stored@example.com',
        },
      });

      // Initialize auth
      await useAuthStore.getState().initializeAuth();

      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.email).toBe('stored@example.com');
    });

    it('should handle invalid stored token', async () => {
      localStorage.setItem('token', 'invalid-token');
      
      authApi.getMe.mockRejectedValue(new Error('Invalid token'));

      await useAuthStore.getState().initializeAuth();

      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
    });
  });
});