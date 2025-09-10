import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../common/decorators/user.decorator';
import { PostsService } from './posts.service';

// 요청 Body의 유효성 검사를 위한 DTO
class CreatePostDto {
  content: string;
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 포스트 생성 (인증 필요)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createPostDto: CreatePostDto, @User() user) {
    // user 객체는 JwtStrategy의 validate에서 반환된 payload입니다.
    const userId = user.sub; // sub는 JWT의 subject로, 사용자의 고유 ID입니다.
    return this.postsService.createPost(createPostDto.content, userId);
  }

  // 나의 포스트 및 연결 관계 조회 (인증 필요)
  @UseGuards(AuthGuard('jwt'))
  @Get('mine')
  async getMyPosts(@User() user) {
    const userId = user.sub;
    return this.postsService.getPostsWithConnections(userId);
  }

  // 모든 포스트 및 연결 관계 조회
  @Get()
  async getAllPosts() {
    return this.postsService.getPostsWithConnections();
  }

  // 특정 사용자의 포스트 및 연결 관계 조회
  @Get('by-user/:userId')
  async getUserPosts(@Param('userId') userId: string) {
    return this.postsService.getPostsWithConnections(userId);
  }
}