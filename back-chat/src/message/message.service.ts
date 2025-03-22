import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  id=0;
  private messages: any[] = [{id:this.id, whoSended: "You", text: "Hi!", chat: 'Hello-chat'},
    {id: this.id++, whoSended: "Interlocutor", text: "Hello!", chat: 'Hello-chat'},
    {id: this.id++, whoSended: "Interlocutor", text: "How are u?", chat: 'Hello-chat'},
    {id: this.id++, whoSended: "You", text: "I'm good!", chat: 'Hello-chat'},
    {id:this.id, whoSended: "john", text: "Ohayo!", chat: 'Hello2-chat'},
    {id: this.id++, whoSended: "Interlocutor", text: "Hello2!", chat: 'Hello2-chat'},
    {id: this.id++, whoSended: "Interlocutor", text: "How are u?", chat: 'Hello2-chat'},
    {id: this.id++, whoSended: "john", text: "I'm good!", chat: 'Hello2-chat'}];

  create(createMessageDto: CreateMessageDto) {
    const newMessage = {
      id: this.messages.length + 1, // Исправлено: +1 для уникальности
      ...createMessageDto,
      timestamp: new Date()
    };
    this.messages.push(newMessage);
    return newMessage;
  }
  
  findAll() {
    return this.messages;
  }
  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
