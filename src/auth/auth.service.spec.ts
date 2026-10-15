import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import { DatabaseService } from '../database/database.service.js';

describe('AuthService', () => {
  let authService: AuthService;

  const rawRefreshToken = 'valid-refresh-token';
  const hashedRefreshToken = bcrypt.hashSync(rawRefreshToken, 10);

  const mockAdmin = {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin1234', 10),
    name: 'ผู้ดูแลระบบ (Admin)',
    role: 'admin',
    refreshToken: hashedRefreshToken,
    createdAt: '2026-10-15T00:00:00.000Z',
  };

  const mockDatabaseService = {
    findAdminByUsername: vi.fn(),
    findAdminById: vi.fn(),
    updateAdminRefreshToken: vi.fn(),
  };

  const mockJwtService = {
    signAsync: vi.fn().mockImplementation((payload, options) => {
      if (options?.secret?.includes('refresh')) {
        return Promise.resolve('new-refresh-token');
      }
      return Promise.resolve('new-access-token');
    }),
    verifyAsync: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService(
      mockDatabaseService as unknown as DatabaseService,
      mockJwtService as unknown as JwtService,
    );
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('login should succeed and return accessToken and refreshToken', async () => {
    mockDatabaseService.findAdminByUsername.mockReturnValue(mockAdmin);

    const result = await authService.login({
      username: 'admin',
      password: 'admin1234',
    });

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(result.admin.username).toBe('admin');
    expect(mockDatabaseService.updateAdminRefreshToken).toHaveBeenCalled();
  });

  it('login should throw UnauthorizedException on wrong password', async () => {
    mockDatabaseService.findAdminByUsername.mockReturnValue(mockAdmin);

    await expect(
      authService.login({ username: 'admin', password: 'wrongpassword' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login should throw UnauthorizedException on non-existent username', async () => {
    mockDatabaseService.findAdminByUsername.mockReturnValue(undefined);

    await expect(
      authService.login({ username: 'unknown', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('refresh should issue new tokens when refreshToken is valid', async () => {
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      username: 'admin',
      name: 'ผู้ดูแลระบบ (Admin)',
      role: 'admin',
    });
    mockDatabaseService.findAdminById.mockReturnValue(mockAdmin);

    const result = await authService.refresh(rawRefreshToken);

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(mockDatabaseService.updateAdminRefreshToken).toHaveBeenCalled();
  });

  it('refresh should throw UnauthorizedException when token verification fails', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(authService.refresh('invalid-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('logout should set refreshToken to null in database', () => {
    const result = authService.logout(1);
    expect(result.success).toBe(true);
    expect(mockDatabaseService.updateAdminRefreshToken).toHaveBeenCalledWith(
      1,
      null,
    );
  });
});
