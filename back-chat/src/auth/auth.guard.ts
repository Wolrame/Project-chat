// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> { //Работает криво-косо, через десять костылин, но работает. НЕ ТРОГАТЬ
    const isWs = context.getType() === 'ws';
    const client = isWs 
      ? context.switchToWs().getClient()
      : context.switchToHttp().getRequest();
    const token = this.extractToken(client); 
    if (!token) return false

    try {
      const payload = await this.jwtService.verifyAsync(token, { 
        secret: jwtConstants.secret 
      });
      client.user = payload;
    } catch {
      console.log('error catched')
      return false;
    }
    return true;
  }

  private extractToken(request: any): string | undefined { //Вероятно это костыль вселенского масштаба. НЕ ТРОГАТЬ
    // Для WebSocket
    if (request?.handshake?.headers) {
      const cookies = request.handshake.headers.cookie;
      const accessTokenCookie = cookies?.split('; ').find(c => c.startsWith('access_token='));
      return accessTokenCookie?.split('=')[1];
    }
    
    // Для HTTP
    if (request.cookies?.access_token) {
      return request.cookies.access_token;
    }

    if (request.headers?.cookie) {
      const cookies = request.headers.cookie;
      const accessTokenCookie = cookies.split('; ').find(c => c.startsWith('access_token='));
      return accessTokenCookie?.split('=')[1];
    }

    return undefined;
  }
}