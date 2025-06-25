import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as jwt from 'jsonwebtoken';
import {Public} from "@app/auth/roles.decorator";

@Controller('auth')
export class AuthController {
    constructor(private usersService: UsersService) {}
    @Public()
    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string,
    ) {
        const user = await this.usersService.findOrCreate(username, password);
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET as string,
        );
        return { token };
    }
}