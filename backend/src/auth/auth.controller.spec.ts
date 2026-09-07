import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { PassportModule } from '@nestjs/passport';
import type { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: () => true },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns a safe public current-user shape', () => {
    const result = controller.getMe({
      user: {
        id: 'user-id',
        name: 'Daria',
        email: 'daria@example.com',
        email_verified: true,
        password_hash: 'should-not-be-returned',
        verification_token: 'should-not-be-returned',
      },
    } as unknown as Request);

    expect(result).toEqual({
      id: 'user-id',
      name: 'Daria',
      email: 'daria@example.com',
      emailVerified: true,
    });
  });

  it('clears the access token cookie on logout', () => {
    const clearCookie = vi.fn();

    controller.logout({ clearCookie } as unknown as Response);

    expect(clearCookie).toHaveBeenCalledWith('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  });
});
