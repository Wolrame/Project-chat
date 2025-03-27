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

  async findAll(username: string) {
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

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
