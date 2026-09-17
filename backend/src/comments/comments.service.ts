import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}
  async getComments() {
    return this.prisma.comments.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
