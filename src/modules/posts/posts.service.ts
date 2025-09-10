import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SupabaseService } from '../supabase/supabase.service';

// Supabase 'posts' 테이블 및 RPC 반환 타입 정의
export type Post = {
  id: number;
  content: string;
  user_id: string;
  embedding: number[];
  created_at: string;
};

export type MatchedPost = {
  id: number;
  content: string;
  similarity: number;
};

export interface MindMapData {
  nodes: Post[];
  edges: { from: number; to: number; similarity: number }[];
}

@Injectable()
export class PostsService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async createPost(content: string, userId: string): Promise<Post> {
    this.logger.log(`Creating post for user ${userId}`);
    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: content,
    });

    const embedding = embeddingResponse.data[0].embedding;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('posts')
      .insert({ content, embedding, user_id: userId })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create post', error.message);
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return data as Post;
  }

  async getPostsWithConnections(userId?: string): Promise<MindMapData> {
    this.logger.log(
      `Getting posts with connections. User ID: ${userId || 'All Users'}`,
    );
    const supabase = this.supabaseService.getClient();

    // 1. 대상 포스트들 조회
    let query = supabase.from('posts').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data: posts, error: postsError } = await query;

    if (postsError) {
      this.logger.error('Failed to fetch posts', postsError.message);
      throw new Error(postsError.message);
    }

    if (!posts || posts.length === 0) {
      return { nodes: [], edges: [] };
    }

    // 2. 각 포스트에 대해 유사한 포스트 찾기 (비효율적일 수 있음 - 개선 필요)
    const edges: { from: number; to: number; similarity: number }[] = [];
    for (const post of posts) {
      const { data: similarPosts, error: rpcError } = await supabase.rpc(
        'match_posts',
        {
          query_embedding: post.embedding,
          match_threshold: 0.75, // 임계값 조정
          match_count: 5,
        },
      );

      if (rpcError) {
        this.logger.warn(
          `Could not find matches for post ${post.id}`,
          rpcError.message,
        );
        continue;
      }

      for (const similar of similarPosts) {
        // 자기 자신과의 연결, 이미 존재하는 연결, 다른 유저의 글과의 연결(userId가 있을 경우) 방지
        if (
          post.id !== similar.id &&
          !edges.some(
            (e) =>
              (e.from === post.id && e.to === similar.id) ||
              (e.from === similar.id && e.to === post.id),
          ) &&
          posts.some((p) => p.id === similar.id) // 현재 조회 대상에 포함된 포스트끼리만 연결
        ) {
          edges.push({ from: post.id, to: similar.id, similarity: similar.similarity });
        }
      }
    }

    return { nodes: posts, edges };
  }
}