import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import { EmailService } from '../email/email.service.js';

const resendVerificationMessage =
  'If an account with this email exists, a verification email has been sent.';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
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

    // 3. Generate a cryptographically secure six-digit verification code
    const verificationCode = randomInt(100000, 1000000).toString();
    
    // 4. Hash the verification token for storage (never store raw tokens)
    const verificationTokenHash = await bcrypt.hash(verificationCode, 10);
    
    // Token expires in 24 hours
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 5. Create user in database
    const user = await this.prisma.users.create({
      data: {
        name: dto.name,
        email: dto.email,
        password_hash: passwordHash,
        email_verified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        email_verified: true,
        created_at: true,
      },
    });

    // 6. Create email verification token
    await this.prisma.email_verification_tokens.create({
      data: {
        user_id: user.id,
        token_hash: verificationTokenHash,
        expires_at: tokenExpiresAt,
      },
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationCode,
    );

    return {
      message: 'User registered successfully. Please verify your email.',
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

    // 5. Check if email has been verified
    // In production, you might want to allow login even if email isn't verified,
    // but in this case we require email verification for security
    if (!user.email_verified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in. Check your inbox for the verification code.'
      );
    }

    // 6. Generate JWT token with minimal payload
    // Include only what's necessary: user ID and email
    const payload = {
      sub: user.id,        // 'sub' is standard JWT claim for subject (user ID)
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    // 7. Return safe user object (without password hash) and token
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

  async verifyEmail(dto: VerifyEmailDto) {
    const now = new Date();

    await this.prisma.email_verification_tokens.deleteMany({
      where: {
        user_id: dto.userId,
        expires_at: { lt: now },
      },
    });

    const user = await this.prisma.users.findUnique({
      where: { id: dto.userId },
      select: { id: true, email_verified: true },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.email_verified) {
      return { message: 'Email is already verified' };
    }

    const tokenRecords = await this.prisma.email_verification_tokens.findMany({
      where: {
        user_id: dto.userId,
        expires_at: { gte: now },
      },
      select: {
        id: true,
        token_hash: true,
      },
    });

    let matchingTokenId: string | undefined;

    for (const tokenRecord of tokenRecords) {
      if (await bcrypt.compare(dto.code, tokenRecord.token_hash)) {
        matchingTokenId = tokenRecord.id;
        break;
      }
    }

    if (!matchingTokenId) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction(async (transaction) => {
      const consumedToken = await transaction.email_verification_tokens.deleteMany({
        where: { id: matchingTokenId },
      });

      if (consumedToken.count !== 1) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      await transaction.users.update({
        where: { id: dto.userId },
        data: { email_verified: true },
      });
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        email_verified: true,
      },
    });

    if (!user || user.email_verified) {
      return { message: resendVerificationMessage };
    }

    const cooldownStartedAt = new Date(Date.now() - 60 * 1000);
    const recentToken = await this.prisma.email_verification_tokens.findFirst({
      where: {
        user_id: user.id,
        created_at: { gte: cooldownStartedAt },
      },
      select: { id: true },
    });

    if (recentToken) {
      return { message: resendVerificationMessage };
    }

    const verificationCode = randomInt(100000, 1000000).toString();
    const verificationTokenHash = await bcrypt.hash(verificationCode, 10);
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.email_verification_tokens.deleteMany({
      where: { user_id: user.id },
    });

    await this.prisma.email_verification_tokens.create({
      data: {
        user_id: user.id,
        token_hash: verificationTokenHash,
        expires_at: tokenExpiresAt,
      },
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationCode,
    );

    return { message: resendVerificationMessage };
  }
}
