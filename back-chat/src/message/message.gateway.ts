import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';


@WebSocketGateway(8080, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
  transports: ['websocket']
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  
  constructor(private readonly messageService: MessageService, private readonly authGuard: AuthGuard) {}

  async handleConnection(client: Socket) {
    try {
      const isAuth = await this.authGuard.canActivate(
        new ExecutionContextHost([client])
      );
      if (!isAuth) {
        console.log(`Auth failed: ${client.id}`);
        client.emit('authError', { message: 'Требуется авторизация' });
        client.disconnect(true);
        return false; // Важно прервать выполнение
      }
      console.log(`Client connected: ${client.id}`);
    } catch (error) {
      console.log(`Auth error: ${client.id}`, error);
      client.emit('authError', { message: 'Ошибка аутентификации' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createMessage')
  async create(client: Socket, createMessageDto: CreateMessageDto) {
    const message = await this.messageService.create(createMessageDto);
    this.server.emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('findAllMessage')
  async findAll(@MessageBody() data: { chat_id: number }) {
    const fullChat = await this.messageService.findAll(data?.chat_id);
    this.server.emit('allMessages', fullChat);
    return fullChat;
  }
}