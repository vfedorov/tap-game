import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { UserRound } from '../models/user-round.model';

@Table({ tableName: 'rounds' })
export class Round extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    startDate: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    endDate: Date;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    totalTaps: number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    totalScore: number;

    @HasMany(() => UserRound)
    userRounds: UserRound[];
}