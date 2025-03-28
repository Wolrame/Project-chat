import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  controllers: [ChatController],
  providers: [ChatService, AuthGuard],
})
export class ChatModule {}
