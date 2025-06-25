import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Round } from '../rounds/round.model';

@Table({ tableName: 'user_rounds' })
export class UserRound extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER })
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Round)
    @Column({ type: DataType.INTEGER })
    roundId: number;

    @BelongsTo(() => Round)
    round: Round;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    tapCount: number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    totalScore: number;
}