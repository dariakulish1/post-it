import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Check if user with this email already exists
    const existingUser = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Hash password with bcrypt (10 salt rounds)
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. Create the user as active; email verification is not required.
    const user = await this.prisma.users.create({
      data: {
        name: dto.name,
        email: dto.email,
        password_hash: passwordHash,
        email_verified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        email_verified: true,
        created_at: true,
      },
    });

    return {
      message: 'User registered successfully. You can now log in.',
      user,
    };
  }

  async login(dto: LoginDto) {
    // 1. Find user by email
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true,
        email_verified: true,
        created_at: true,
      },
    });

    // 2. If user not found, return 401 (don't reveal that email doesn't exist)
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Compare provided password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);

    // 4. If password doesn't match, return 401
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 5. Generate JWT token with minimal payload
    // Include only what's necessary: user ID and email
    const payload = {
      sub: user.id,        // 'sub' is standard JWT claim for subject (user ID)
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    // 6. Return safe user object (without password hash) and token
    // Note: The controller will set the token in an HttpOnly cookie
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
        created_at: user.created_at,
        // password_hash is NOT included ✓
      },
    };
  }

}
