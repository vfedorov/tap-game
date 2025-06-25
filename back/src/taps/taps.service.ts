import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserRound } from '../models/user-round.model';
import { Round } from '../rounds/round.model';
import { User } from '../models/user.model';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class TapsService {
    constructor(
        @InjectModel(UserRound)
        private userRoundModel: typeof UserRound,
        @InjectModel(Round)
        private roundModel: typeof Round,
        private sequelize: Sequelize,
    ) {}

    async processTap(userId: number, roundId: number): Promise<{ tapCount: number; totalScore: number }> {
        return this.sequelize.transaction(async (transaction: Transaction) => {
            const user = await User.findByPk(userId, { transaction });
            if (!user) throw new Error('User not found');

            const round = await this.roundModel.findByPk(roundId, {
                lock: true,
                transaction,
            });

            const now = new Date();
            if (now < (round?.startDate || 0) || now > (round?.endDate || 0)) {
                throw new Error('Round is not active');
            }

            let userRound = await this.userRoundModel.findOne({
                where: { userId, roundId },
                lock: true,
                transaction,
            });

            if (!userRound) {
                userRound = await this.userRoundModel.create({
                    userId,
                    roundId,
                    tapCount: 0,
                    totalScore: 0,
                }, { transaction });
            }

            // Для пользователя "Никита" не считаем очки
            if (user.role === 'nikita') {
                userRound.tapCount += 1;
                await userRound.save({ transaction });
                return { tapCount: userRound.tapCount, totalScore: 0 };
            }

            const newTapCount = userRound.tapCount + 1;
            let scoreIncrement = 1;

            if (newTapCount % 11 === 0) {
                scoreIncrement = 10;
            }

            const newTotalScore = userRound.totalScore + scoreIncrement;

            await userRound.update({
                tapCount: newTapCount,
                totalScore: newTotalScore,
            }, { transaction });

            await round?.update({
                totalTaps: round.totalTaps + 1,
                totalScore: round.totalScore + scoreIncrement,
            }, { transaction });

            return { tapCount: newTapCount, totalScore: newTotalScore };
        });
    }
}