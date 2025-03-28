import { Controller, Get, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "src/auth/auth.guard";

@Controller('/user')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll()
    {
        return this.usersService.findAll() //Возвращает список никнеймов юзеров
    }
}