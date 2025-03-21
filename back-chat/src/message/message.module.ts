import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { AuthGuard } from 'src/auth/auth.guard';


@Module({
  providers: [MessageGateway, MessageService, AuthGuard],
})
export class MessageModule {}
