import {
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service.js';
import { LoginDto } from './dto/login.dto.js';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends TokenResponse {
  admin: {
    id: number;
    username: string;
    name: string;
    role: string;
  };
}

interface JwtPayload {
  sub: number;
  username: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    @Optional() private readonly configService?: ConfigService,
  ) {}

  private async generateTokens(admin: {
    id: number;
    username: string;
    name: string;
    role: string;
  }): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
    };

    const accessSecret =
      this.configService?.get<string>('JWT_SECRET') ||
      process.env.JWT_SECRET ||
      'poc1-super-secret-jwt-key-2026-secure-auth';
    const accessExpiresIn =
      this.configService?.get<string>('JWT_EXPIRES_IN') ||
      process.env.JWT_EXPIRES_IN ||
      '15m';

    const refreshSecret =
      this.configService?.get<string>('JWT_REFRESH_SECRET') ||
      process.env.JWT_REFRESH_SECRET ||
      'poc1-super-secret-refresh-key-2026-secure-auth';
    const refreshExpiresIn =
      this.configService?.get<string>('JWT_REFRESH_EXPIRES_IN') ||
      process.env.JWT_REFRESH_EXPIRES_IN ||
      '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}` | number,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}` | number,
      }),
    ]);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    this.databaseService.updateAdminRefreshToken(admin.id, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const admin = this.databaseService.findAdminByUsername(loginDto.username);

    if (!admin || !admin.password) {
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    const isMatch = await bcrypt.compare(loginDto.password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    const tokens = await this.generateTokens(admin);

    return {
      ...tokens,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const refreshSecret =
      this.configService?.get<string>('JWT_REFRESH_SECRET') ||
      process.env.JWT_REFRESH_SECRET ||
      'poc1-super-secret-refresh-key-2026-secure-auth';

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh Token ไม่ถูกต้อง หรือหมดอายุแล้ว');
    }

    const admin = this.databaseService.findAdminById(payload.sub);
    if (!admin || !admin.refreshToken) {
      throw new UnauthorizedException('Refresh Token ไม่ถูกต้อง หรือถูกยกเลิกแล้ว');
    }

    const isTokenMatch = await bcrypt.compare(refreshToken, admin.refreshToken);
    if (!isTokenMatch) {
      throw new UnauthorizedException('Refresh Token ไม่ถูกต้อง');
    }

    // Rotate tokens
    return this.generateTokens(admin);
  }

  logout(adminId: number): { success: boolean; message: string } {
    this.databaseService.updateAdminRefreshToken(adminId, null);
    return {
      success: true,
      message: 'ออกจากระบบสำเร็จ',
    };
  }

  getProfile(adminId: number) {
    const admin = this.databaseService.findAdminById(adminId);
    if (!admin) {
      throw new UnauthorizedException('ไม่พบข้อมูลผู้ดูแลระบบ');
    }
    const {
      password: _password,
      refreshToken: _refreshToken,
      ...profile
    } = admin;
    return profile;
  }
}
