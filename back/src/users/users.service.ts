import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
    ) {}

    async findOrCreate(username: string, password: string): Promise<User> {
        const user = await this.userModel.findOne({ where: { username } });

        if (user) {
            if (!bcrypt.compareSync(password, user.password)) {
                throw new Error('Invalid password');
            }
            return user;
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        let role: string;

        if (username.toLowerCase() === 'admin') {
            role = 'admin';
        } else if (username.toLowerCase() === 'никита') {
            role = 'nikita';
        } else {
            role = 'user';
        }

        return this.userModel.create({
            username,
            password: hashedPassword,
            role,
        });
    }

    async findById(id: number): Promise<User | null> {
        return this.userModel.findByPk(id);
    }
}