
import { Body, Controller, Post, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Res({ passthrough: true }) res: Response, @Body() signInDto: Record<string, any>) {
    const {access_token} = await this.authService.signIn(signInDto.username, signInDto.password);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      maxAge: 600 * 1000, // 10 минут
      sameSite: 'strict',
    });
    res.cookie('username', signInDto.username, {
      maxAge: 600 * 1000, // 10 минут
      sameSite: 'strict',
    });
    return { status: 'success' };
  }
  
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async signUp(@Res({ passthrough: true }) res: Response, @Body() signInDto: Record<string, any>) {
    const {access_token} = await this.authService.signUp(signInDto.username, signInDto.password);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      maxAge: 600 * 1000, // 10 минут
      sameSite: 'strict',
    });
    res.cookie('username', signInDto.username, {
      maxAge: 600 * 1000, // 10 минут
      sameSite: 'strict',
    });
    return { status: 'success' };
  }
}
