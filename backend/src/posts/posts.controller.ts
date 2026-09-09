import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { Request } from 'express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts() {
    return this.postsService.getPosts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  getMyPosts(@Req() req: Request) {
    const user = req.user as { id: string };

    return this.postsService.getPostsByAuthor(user.id);
  }

  @Get(':id')
  getPostById(@Param('id', ParseIntPipe) postId: number) {
    return this.postsService.getPostById(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createPost(@Body() dto: CreatePostDto, @Req() req: Request) {
    const user = req.user as { id: string };

    return this.postsService.createPost(dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updatePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };

    return this.postsService.updatePost(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deletePost(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = req.user as { id: string };

    return this.postsService.deletePost(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  createComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };

    return this.postsService.createComment(id, dto, user.id);
  }
}
