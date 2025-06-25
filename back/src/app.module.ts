import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { RoundsController } from './rounds/rounds.controller';
import { TapsController } from './taps/taps.controller';
import { UsersService } from './users/users.service';
import { RoundsService } from './rounds/rounds.service';
import { TapsService } from './taps/taps.service';
import { User } from './models/user.model';
import { Round } from './rounds/round.model';
import { UserRound } from './models/user-round.model';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot(),
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            models: [User, Round, UserRound],
        }),
        SequelizeModule.forFeature([User, Round, UserRound]),
    ],
    controllers: [AuthController, RoundsController, TapsController],
    providers: [
        UsersService,
        RoundsService,
        TapsService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}