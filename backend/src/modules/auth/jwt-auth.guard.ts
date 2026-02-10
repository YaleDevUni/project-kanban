// backend/src/auth/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // SSE 요청의 경우 쿼리 파라미터에서 토큰 추출
    const token = request.query?.token;
    if (token && typeof token === 'string') {
      request.headers.authorization = `Bearer ${token}`;
    }

    return super.canActivate(context);
  }
}
