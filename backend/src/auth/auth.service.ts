import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { AppConfig } from '../config/configuration';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthTokensResponse } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const REFRESH_COOKIE_NAME = 'refresh_token';
const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async register(dto: RegisterDto, res: Response): Promise<AuthTokensResponse> {
    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    const existingUsername = await this.usersService.findByUsername(
      dto.username,
    );
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
    });

    return this.issueTokens(user, res);
  }

  async login(dto: LoginDto, res: Response): Promise<AuthTokensResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user, res);
  }

  async refresh(userId: string, res: Response): Promise<AuthTokensResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user, res);
  }

  private async issueTokens(
    user: User,
    res: Response,
  ): Promise<AuthTokensResponse> {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwtAccessSecret', { infer: true }),
      expiresIn: this.configService.get('jwtAccessTtl', { infer: true }),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwtRefreshSecret', { infer: true }),
      expiresIn: this.configService.get('jwtRefreshTtl', { infer: true }),
    });

    this.setRefreshCookie(res, refreshToken);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    const nodeEnv = this.configService.get('nodeEnv', { infer: true });
    const refreshTtl = this.configService.get('jwtRefreshTtl', {
      infer: true,
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: nodeEnv === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: this.parseTtlToMs(refreshTtl),
    });
  }

  private parseTtlToMs(ttl: string): number {
    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}

export { REFRESH_COOKIE_NAME };
