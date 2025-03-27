
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This should be a real class/interface representing a user entity
export type User = {
  id: number,
  username: string,
  password: string
};
async function connect() {
  await prisma.$connect()
}
connect()

@Injectable()
export class UsersService {

  async findOne(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        username: username,
      },
    })
  }

  async findAll(): Promise<object | null> {
    return await prisma.user.findMany({
      select: {
        username:true
      }
    })
  }

  async createOne(username: string, password: string): Promise<User> {
    const existingUser = await this.findOne(username);
    if (existingUser) {
      throw new DOMException('User already exists');
    }

    // 2. Создаем нового пользователя
    return prisma.user.create({
      data: {
        username,
        password, // Наверное надо хэшировать но я ленивый и это пет-проект
      },
    });
  }
}
