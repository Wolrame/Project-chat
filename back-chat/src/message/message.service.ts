import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()
@Injectable()
export class MessageService {


  async create(createMessageDto: CreateMessageDto) {

    const newMessage = await prisma.messages.create({//Заносит в базу данных новое сообщение
      data: {
        WhoSended: createMessageDto.WhoSended,
        text: createMessageDto.text,
        chat: createMessageDto.chat
      }
    })
    return newMessage;
  }
  
  findAll(chatId=0) { //Как без этой костыли я не знаю
    return prisma.chats.findUnique({//Возвращает объект {chat_id, chat, messages[{id, WhoSended, text, chat}]}
      where: {//Наверное надо возвращать не такую тупую хрень, но я не знаю о чём думал когда это писал
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
