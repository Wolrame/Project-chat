// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Для WebSocket получаем объект клиента
    const isWs = context.getType() === 'ws';
    const client = isWs 
      ? context.switchToWs().getClient()
      : context.switchToHttp().getRequest();
    const token = this.extractToken(isWs ? client.handshake : client);
    if (!token) return false

    try {
      const payload = await this.jwtService.verifyAsync(token, { 
        secret: jwtConstants.secret 
      });
      client.user = payload;
    } catch {
      return false;
    }
    return true;
  }

  private extractToken(request: any): string | undefined {
    // Для WebSocket
    if (request.headers) {
      const [type, token] = request.auth?.token?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
    
    // Для HTTP
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}