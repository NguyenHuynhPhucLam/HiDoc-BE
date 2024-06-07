'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patient_Info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Patient_Info.init(
    {
      patientId: DataTypes.STRING,
      name: DataTypes.STRING,
      symptom: DataTypes.TEXT,
      diagnose: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Patient_Info',
      freezeTableName: true,
    }
  );
  return Patient_Info;
};
