'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('user_rounds', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            roundId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'rounds',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            tapCount: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            totalScore: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        // Добавляем составной уникальный индекс
        await queryInterface.addIndex('user_rounds', ['userId', 'roundId'], {
            unique: true,
            name: 'user_round_unique'
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('user_rounds');
    }
};