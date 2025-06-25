import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {Round} from './round.model';
import {ConfigService} from '@nestjs/config';
import {UserRound} from '../models/user-round.model';
import {User} from '../models/user.model';

@Injectable()
export class RoundsService {
    constructor(
        @InjectModel(Round)
        private roundModel: typeof Round,
        @InjectModel(UserRound)
        private userRoundModel: typeof UserRound,
        private configService: ConfigService,
    ) {}

    async createRound(): Promise<Round> {
        const cooldown = (this.configService.get<number>('COOLDOWN_DURATION') || 0) * 60000;
        const duration = (this.configService.get<number>('ROUND_DURATION') || 0) * 60000;

        const now = new Date();
        const startDate = new Date(now.getTime() + cooldown);
        const endDate = new Date(startDate.getTime() + duration);

        return this.roundModel.create({startDate, endDate});
    }

    async findAllRounds(): Promise<Round[]> {
        return this.roundModel.findAll();
    }

    async findRoundById(id: number, userId: number): Promise<any> {
        const round = await this.roundModel.findByPk(id);
        if (!round) throw new Error('Round not found');

        const now = new Date();
        let status: string;

        if (now < round.startDate) status = 'scheduled';
        else if (now > round.endDate) status = 'finished';
        else status = 'active';

        let winner = null;
        if (status === 'finished') {
            const winnerData = await this.userRoundModel.findOne({
                where: {roundId: id},
                order: [['totalScore', 'DESC']],
                include: [User],
            });
            winner = winnerData?.user;
        }

        const userRound = await this.userRoundModel.findOne({
            where: {userId, roundId: id},
        });

        return {
            ...round.toJSON(),
            status,
            winner: winner ? {id: winner.id, username: winner.username} : null,
            userStats: userRound ? {
                tapCount: userRound.tapCount,
                totalScore: userRound.totalScore
            } : null,
        };
    }
}