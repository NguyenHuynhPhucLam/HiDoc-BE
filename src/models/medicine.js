'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Medicine extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Medicine.init(
    {
      name: DataTypes.STRING,
      unit: DataTypes.STRING,
      usage: DataTypes.STRING,
      pricePerUnit: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Medicine',
    }
  );
  return Medicine;
};
