
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataService } from './dataService';


vi.mock('./supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: {}, error: null }),
      rpc: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
    auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: { user: {id: 'test-user-id'} } } }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    }
  }
}));


vi.mock('./utils/cacheUtils', () => ({
  createCache: vi.fn(() => ({})),
  isCacheValid: vi.fn(() => false),
  updateCache: vi.fn(),
  getCache: vi.fn(() => null),
  invalidateCache: vi.fn(),
  clearAllCaches: vi.fn(),
}));


describe('dataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide access to supabaseClient', () => {
    expect(dataService.supabaseClient()).toBeDefined();
  });

  it('should have memberService defined', () => {
    expect(dataService.memberService).toBeDefined();
    expect(typeof dataService.memberService.getAll).toBe('function');
  });

  it('should have classService defined', () => {
    expect(dataService.classService).toBeDefined();
    expect(typeof dataService.classService.getAll).toBe('function');
  });
  
  it('should have bookingService defined', () => {
    expect(dataService.bookingService).toBeDefined();
    expect(typeof dataService.bookingService.bookClass).toBe('function');
  });

  it('should have attendanceService defined', () => {
    expect(dataService.attendanceService).toBeDefined();
    expect(typeof dataService.attendanceService.getRecords).toBe('function');
  });
  
  it('getLoggedInUser should return null if no user in localStorage', () => {
    const user = dataService.auth.getLoggedInUser();
    expect(user).toBeNull();
  });

  it('getLoggedInUser should return user from localStorage', () => {
    const mockUser = { id: '123', email: 'test@example.com', role: 'member' };
    localStorage.setItem('loggedInUser', JSON.stringify(mockUser));
    const user = dataService.auth.getLoggedInUser();
    expect(user).toEqual(mockUser);
  });

  it('getLoggedInUser should return impersonated user if impersonating', () => {
    const adminUser = { id: 'admin1', role: 'staff' };
    const impersonatedUser = { id: 'member1', role: 'member', name: 'Impersonated Member' };
    localStorage.setItem('loggedInUser', JSON.stringify(adminUser));
    localStorage.setItem('impersonationData', JSON.stringify({ isImpersonating: true, adminUser, impersonatedUser }));
    
    const user = dataService.auth.getLoggedInUser();
    expect(user).toEqual(impersonatedUser);
  });
  
  it('getLoggedInUserId should return user ID if user is logged in', () => {
    const mockUser = { id: 'user-id-123', email: 'test@example.com', role: 'member' };
    localStorage.setItem('loggedInUser', JSON.stringify(mockUser));
    const userId = dataService.auth.getLoggedInUserId();
    expect(userId).toBe('user-id-123');
  });

  it('getLoggedInUserId should return null if no user is logged in', () => {
    const userId = dataService.auth.getLoggedInUserId();
    expect(userId).toBeNull();
  });

});


