import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule], // SupabaseModule을 import합니다.
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
