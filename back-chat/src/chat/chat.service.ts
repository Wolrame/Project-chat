import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient;
@Injectable()
export class ChatService {
  async create(createChatDto: CreateChatDto) {
    const chat_id = await prisma.chats.create({
      data: {
        chat: createChatDto.chat
      },
      select: {
        chat_id: true
      }
    })
    return prisma.inChat.createMany({
      data: createChatDto.users.map(el=> {return {username: el, chat_id: chat_id.chat_id}})
    })
  }

  async findAll(username: string) {//Выдаёт список чатов данного пользователя
    return await prisma.inChat.findMany({
      where: {
        username: username
      },
      select: {
        chat_id: true,
        chats: {
          select: {
            chat: true
          }
        }
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  async remove(chat_id: number) {
    await prisma.inChat.deleteMany({
      where: {
        chat_id: chat_id
      }
    })
    
    await prisma.messages.deleteMany({
      where: {
        chat: chat_id
      }
    })

    return await prisma.chats.delete({
      where: {
        chat_id: chat_id
      }
    })
  }
}
