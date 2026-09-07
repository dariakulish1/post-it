import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PassportModule } from '@nestjs/passport';
import type { Request } from 'express';

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            createPost: vi.fn(),
            updatePost: vi.fn(),
            deletePost: vi.fn(),
            createComment: vi.fn(),
          },
        },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: () => true },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('uses the authenticated user as the post author', () => {
    const dto = {
      title: 'Title',
      anons: 'Summary',
      full_text: 'Content',
    };

    controller.createPost(dto, {
      user: { id: 'authenticated-user-id' },
    } as unknown as Request);

    expect((controller as any).postsService.createPost).toHaveBeenCalledWith(
      dto,
      'authenticated-user-id',
    );
  });

  it('uses the authenticated user for comments', () => {
    const dto = { text: 'A comment' };

    controller.createComment('post-id', dto, {
      user: { id: 'authenticated-user-id' },
    } as unknown as Request);

    expect((controller as any).postsService.createComment).toHaveBeenCalledWith(
      'post-id',
      dto,
      'authenticated-user-id',
    );
  });
});
