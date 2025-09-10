import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Module({
  providers: [SupabaseService],
  exports: [SupabaseService], // SupabaseService를 다른 모듈에서 사용할 수 있도록 export합니다.
})
export class SupabaseModule {}
