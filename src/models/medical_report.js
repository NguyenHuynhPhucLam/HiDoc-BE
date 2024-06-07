'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Medical_Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Medical_Report.init(
    {
      patientId: DataTypes.STRING,
      medicineId: DataTypes.STRING,
      amount: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Medical_Report',
      freezeTableName: true,
    }
  );
  return Medical_Report;
};
