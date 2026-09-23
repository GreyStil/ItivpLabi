'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Campaigns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      channel: {
        type: Sequelize.STRING
      },
      budget: {
        type: Sequelize.DECIMAL
      },
      spent: {
        type: Sequelize.DECIMAL
      },
      clicks: {
        type: Sequelize.INTEGER
      },
      conversions: {
        type: Sequelize.INTEGER
      },
      revenue: {
        type: Sequelize.DECIMAL
      },
      status: {
        type: Sequelize.STRING
      },
      cpc: {
        type: Sequelize.DECIMAL
      },
      conversionRate: {
        type: Sequelize.DECIMAL
      },
      roi: {
        type: Sequelize.DECIMAL
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Campaigns');
  }
};