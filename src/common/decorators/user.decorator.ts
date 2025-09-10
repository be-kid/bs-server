import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @UseGuards(JwtAuthGuard) 와 함께 사용되어야 합니다.
 * request 객체에서 user 정보를 추출합니다.
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
