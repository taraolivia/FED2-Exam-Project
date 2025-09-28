/**
 * Authentication flow tests
 */
import { login, register, logout, getStoredUser } from '@/lib/auth';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Authentication', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    localStorage.clear();
  });

  describe('login', () => {
    it('should authenticate user with valid credentials', async () => {
      const mockResponse = {
        data: {
          name: 'test_user',
          email: 'test@stud.noroff.no',
          accessToken: 'mock-token',
          bio: 'Test bio',
          venueManager: false
        }
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: mockResponse.data })
        });

      const result = await login({
        email: 'test@stud.noroff.no',
        password: 'password123'
      });

      expect(result.name).toBe('test_user');
      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw error for invalid credentials', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          errors: [{ message: 'Invalid credentials' }]
        })
      });

      await expect(login({
        email: 'invalid@stud.noroff.no',
        password: 'wrong'
      })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should clear stored user data', () => {
      localStorage.setItem('user', JSON.stringify({ name: 'test' }));
      logout();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});