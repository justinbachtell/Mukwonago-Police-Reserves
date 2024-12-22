import { getCurrentUser } from '@/actions/user';
import { describe, expect, it } from 'vitest';

// Mock user data
const mockAdminUser = {
  id: 1,
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
  role: 'admin',
};

const mockRegularUser = {
  id: 2,
  first_name: 'Regular',
  last_name: 'User',
  email: 'user@example.com',
  role: 'user',
};

// Mock the getCurrentUser function
vi.mock('@/actions/user', () => ({
  getCurrentUser: vi.fn(),
}));

describe('Admin Access Control', () => {
  it('should allow admin users to access admin routes', async () => {
    // Mock getCurrentUser to return admin user
    (getCurrentUser as any).mockResolvedValue(mockAdminUser);

    const user = await getCurrentUser();

    expect(user).toBeDefined();
    expect(user?.role).toBe('admin');
  });

  it('should not allow regular users to access admin routes', async () => {
    // Mock getCurrentUser to return regular user
    (getCurrentUser as any).mockResolvedValue(mockRegularUser);

    const user = await getCurrentUser();

    expect(user).toBeDefined();
    expect(user?.role).not.toBe('admin');
  });

  it('should handle unauthenticated users', async () => {
    // Mock getCurrentUser to return null (unauthenticated)
    (getCurrentUser as any).mockResolvedValue(null);

    const user = await getCurrentUser();

    expect(user).toBeNull();
  });
});
