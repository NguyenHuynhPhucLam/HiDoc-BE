const { Sequelize } = require('sequelize');

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize('phuclam', 'root', null, {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, //Hide Query when connect to db (You also need to add this line to config.json file)
});

let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = connectDB;
