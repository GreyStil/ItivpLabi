'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Campaign extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Campaign.init({
    name: DataTypes.STRING,
    channel: DataTypes.STRING,
    budget: DataTypes.DECIMAL,
    spent: DataTypes.DECIMAL,
    clicks: DataTypes.INTEGER,
    conversions: DataTypes.INTEGER,
    revenue: DataTypes.DECIMAL,
    status: DataTypes.STRING,
    cpc: DataTypes.DECIMAL,
    conversionRate: DataTypes.DECIMAL,
    roi: DataTypes.DECIMAL,
    priority: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Campaign',
  });
  return Campaign;
};