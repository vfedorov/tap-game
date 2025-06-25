import { Table, Column, Model, DataType } from 'sequelize-typescript';
export enum UserRole {
    USER = 'user',
    NIKITA = 'nikita',
    ADMIN = 'admin',
}

@Table({ tableName: 'users' })
export class User extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id: number;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    username: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password: string;

    @Column({
        type: DataType.ENUM(...Object.values(UserRole)),
        defaultValue: UserRole.USER,
    })
    role: UserRole;
}