import { Controller, Post, Param, Req } from '@nestjs/common';
import { TapsService } from './taps.service';
import { Request } from 'express';

@Controller('taps')
export class TapsController {
    constructor(private tapsService: TapsService) {}

    @Post(':roundId')
    async tap(
        @Param('roundId') roundId: string,
        @Req() req: Request,
    ) {
        return this.tapsService.processTap(
            req.user.id,
            parseInt(roundId),
        );
    }
}