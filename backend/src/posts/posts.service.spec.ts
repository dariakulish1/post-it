import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('PostsService', () => {
  let service: PostsService;
  let prisma: {
    posts: {
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      posts: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds a post by its sequential post_id', async () => {
    const post = {
      post_id: 1,
      title: 'First post',
      users: { name: 'Daria' },
    };
    prisma.posts.findFirst.mockResolvedValue(post);

    await expect(service.getPostById(1)).resolves.toEqual({
      post_id: 1,
      title: 'First post',
      author_name: 'Daria',
      users: undefined,
    });

    expect(prisma.posts.findFirst).toHaveBeenCalledWith({
      where: { post_id: 1 },
    });
  });

  it('updates a post owned by the authenticated user', async () => {
    prisma.posts.findUnique.mockResolvedValue({
      id: 'post-id',
      author_id: 'owner-id',
    });
    prisma.posts.update.mockResolvedValue({ id: 'post-id' });

    await service.updatePost('post-id', { title: 'Updated' }, 'owner-id');

    expect(prisma.posts.update).toHaveBeenCalledWith({
      where: { id: 'post-id' },
      data: { title: 'Updated' },
    });
  });

  it('rejects updates from a different user', async () => {
    prisma.posts.findUnique.mockResolvedValue({
      id: 'post-id',
      author_id: 'owner-id',
    });

    await expect(
      service.updatePost('post-id', { title: 'Updated' }, 'other-user-id'),
    ).rejects.toMatchObject({ status: 403 });

    expect(prisma.posts.update).not.toHaveBeenCalled();
  });
});
