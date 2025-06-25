import { Controller, Get, Post, Req, Param } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../models/user.model';

@Controller('rounds')
export class RoundsController {
    constructor(private roundsService: RoundsService) {}

    @Get()
    async findAll() {
        return this.roundsService.findAllRounds();
    }

    @Post()
    @Roles(UserRole.ADMIN)
    async create() {
        return this.roundsService.createRound();
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @Req() req: Request,
    ) {
        const userId = req.user.id;
        return this.roundsService.findRoundById(parseInt(id), userId);
    }
}