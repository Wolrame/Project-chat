import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway(8080, {
  cors: {
    origin: 'http://localhost:3000', // Адрес фронтенда
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket']
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  
  constructor(private readonly messageService: MessageService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createMessage')
  async create(client: Socket, createMessageDto: CreateMessageDto) {
    const message = await this.messageService.create(createMessageDto);
    this.server.emit('newMessage', message); // Изменили название события
    return message;
  }

  @SubscribeMessage('findAllMessage')
  async findAll() {
    const messages = await this.messageService.findAll();
    this.server.emit('allMessages', messages);
    return messages;
  }
}