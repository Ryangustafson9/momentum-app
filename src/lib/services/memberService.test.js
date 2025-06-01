
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as memberService from './memberService';
import { supabase } from '@/lib/supabaseClient'; // Actual instance for mocking

vi.mock('@/lib/supabaseClient.js');
vi.mock('@/lib/utils.js', () => ({
  generateUUID: vi.fn(() => 'mock-uuid'),
}));

const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
  rpc: vi.fn(),
};

describe('memberService', () => {
  const mockInvalidateCache = vi.fn();
  const mockIsValidUUID = vi.fn((id) => typeof id === 'string' && id.length > 0); // Simple mock

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks for supabaseClient methods
    Object.values(mockSupabaseClient).forEach(mockFn => {
      if (typeof mockFn.mockClear === 'function') {
        mockFn.mockClear();
      }
      if (typeof mockFn.mockReset === 'function') {
        mockFn.mockReset();
      }
      // Ensure 'this' is returned for chained calls
      if (['from', 'select', 'insert', 'update', 'eq', 'or', 'order'].includes(mockFn.getMockName ? mockFn.getMockName() : '')) {
        mockFn.mockReturnThis();
      }
    });
    supabase.from = vi.fn(() => mockSupabaseClient); // Ensure supabase.from() returns our mock client
  });

  describe('getMembers', () => {
    it('should fetch members from Supabase', async () => {
      const mockMembers = [{ id: '1', name: 'John Doe' }];
      mockSupabaseClient.order.mockResolvedValue({ data: mockMembers, error: null });
      
      const members = await memberService.getMembers(supabase, () => false, () => {}, () => null);
      expect(supabase.from).toHaveBeenCalledWith('members');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(members).toEqual(mockMembers);
    });

    it('should throw an error if Supabase fetch fails', async () => {
      const mockError = new Error('Fetch failed');
      mockSupabaseClient.order.mockResolvedValue({ data: null, error: mockError });
      await expect(memberService.getMembers(supabase, () => false, () => {}, () => null)).rejects.toThrow('Failed to fetch members: Fetch failed');
    });
  });

  describe('getMemberById', () => {
    it('should fetch a member by ID from Supabase', async () => {
      const mockMember = { id: '1', name: 'John Doe' };
      mockSupabaseClient.single.mockResolvedValue({ data: mockMember, error: null });

      const member = await memberService.getMemberById(supabase, '1', mockIsValidUUID, () => null);
      expect(supabase.from).toHaveBeenCalledWith('members');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', '1');
      expect(mockSupabaseClient.single).toHaveBeenCalled();
      expect(member).toEqual(mockMember);
    });

    it('should return null if member not found (PGRST116)', async () => {
      mockSupabaseClient.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
      const member = await memberService.getMemberById(supabase, '1', mockIsValidUUID, () => null);
      expect(member).toBeNull();
    });
  });

  describe('addMember', () => {
    it('should add a member using RPC and invalidate cache', async () => {
      const newMemberPayload = { email: 'new@example.com', first_name: 'New', last_name: 'User' };
      const expectedSavedMember = { ...newMemberPayload, id: 'mock-uuid', name: 'New User', system_member_id: expect.any(Number), created_at: expect.any(String), updated_at: expect.any(String), profile_creation_date: expect.any(String), join_date: expect.any(String), status: 'Active', role: 'member' };
      mockSupabaseClient.rpc.mockResolvedValue({ data: [expectedSavedMember], error: null });

      const result = await memberService.addMember(supabase, newMemberPayload, mockInvalidateCache);
      
      expect(supabase.rpc).toHaveBeenCalledWith('create_member_transactional', { 
        member_payload: expect.objectContaining({ email: 'new@example.com', id: 'mock-uuid' })
      });
      expect(mockInvalidateCache).toHaveBeenCalledWith('members');
      expect(result).toEqual(expectedSavedMember);
    });
  });
  
  describe('updateMember', () => {
    it('should update a member and invalidate cache', async () => {
      const memberId = '1';
      const updatedData = { name: 'Jane Doe Updated' };
      const expectedUpdatedMember = { id: memberId, ...updatedData, updated_at: expect.any(String) };
      mockSupabaseClient.single.mockResolvedValue({ data: expectedUpdatedMember, error: null });

      const result = await memberService.updateMember(supabase, memberId, updatedData, mockIsValidUUID, mockInvalidateCache);
      expect(supabase.from).toHaveBeenCalledWith('members');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe Updated' }));
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', memberId);
      expect(mockInvalidateCache).toHaveBeenCalledWith('members');
      expect(result).toEqual(expectedUpdatedMember);
    });
  });

});


