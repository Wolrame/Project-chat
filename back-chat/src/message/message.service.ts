import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()
@Injectable()
export class MessageService {


  async create(createMessageDto: CreateMessageDto) {

    const newMessage = await prisma.messages.create({
      data: {
        WhoSended: createMessageDto.WhoSended,
        text: createMessageDto.text,
        chat: createMessageDto.chat
      }
    })
    return newMessage;
  }
  
  findAll(chatId=0) {
    return prisma.chats.findUnique({
      where: {
        chat_id: chatId
      },
      include: {
        messages: true
      }
    })
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
