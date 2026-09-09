import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPosts() {
    return this.prisma.posts.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getPostById(postId: number) {
    const post = await this.prisma.posts.findFirst({
      where: { post_id: postId },
      include: {
        users: {
          select: { name: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      ...post,
      author_name: post.users.name,
      users: undefined,
    };
  }

  async createPost(dto: CreatePostDto, authorId: string) {
    return this.prisma.posts.create({
      data: {
        title: dto.title,
        anons: dto.anons,
        full_text: dto.full_text,
        image_url: dto.image_url,
        image_path: dto.image_path,
        author_id: authorId,
      },
    });
  }

  private async assertPostOwner(id: string, userId: string) {
    const post = await this.prisma.posts.findUnique({
      where: { id },
      select: { id: true, author_id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author_id !== userId) {
      throw new ForbiddenException('You do not own this post');
    }

    return post;
  }

  async updatePost(id: string, dto: UpdatePostDto, userId: string) {
    await this.assertPostOwner(id, userId);

    return this.prisma.posts.update({
      where: { id },
      data: dto,
    });
  }

  async deletePost(id: string, userId: string) {
    await this.assertPostOwner(id, userId);

    await this.prisma.posts.delete({ where: { id } });

    return { message: 'Post deleted successfully' };
  }

  async createComment(id: string, dto: CreateCommentDto, authorId: string) {
    const post = await this.prisma.posts.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.comments.create({
      data: {
        text: dto.text,
        post_id: id,
        author_id: authorId,
      },
    });
  }
}