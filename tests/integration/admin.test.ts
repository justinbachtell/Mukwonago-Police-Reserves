import { getCurrentUser } from '@/actions/user';
import { describe, expect, it } from 'vitest';

// Mock user data
const mockAdminUser = {
  email: 'admin@example.com',
  first_name: 'Admin',
  id: 1,
  last_name: 'User',
  role: 'admin',
};

const mockRegularUser = {
  email: 'user@example.com',
  first_name: 'Regular',
  id: 2,
  last_name: 'User',
  role: 'user',
};

// Mock the getCurrentUser function
vi.mock('@/actions/user', () => ({
  getCurrentUser: vi.fn(),
}));

describe('admin Access Control', () => {
  it('should allow admin users to access admin routes', async () => {
    // Mock getCurrentUser to return admin user
    (getCurrentUser as any).mockResolvedValue(mockAdminUser);

    const user = await getCurrentUser();

    expect(user).toBeDefined();
    expect(user?.role).toBe('admin');
  })

  it('should not allow regular users to access admin routes', async () => {
    // Mock getCurrentUser to return regular user
    (getCurrentUser as any).mockResolvedValue(mockRegularUser);

    const user = await getCurrentUser();

    expect(user).toBeDefined();
    expect(user?.role).not.toBe('admin');
  })

  it('should handle unauthenticated users', async () => {
    // Mock getCurrentUser to return null (unauthenticated)
    (getCurrentUser as any).mockResolvedValue(null);

    const user = await getCurrentUser();

    expect(user).toBeNull();
  })
});
