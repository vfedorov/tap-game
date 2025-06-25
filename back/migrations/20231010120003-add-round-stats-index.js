'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('user_rounds', ['roundId', 'totalScore'], {
            name: 'round_leaderboard_index',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex('user_rounds', 'round_leaderboard_index');
    }
};