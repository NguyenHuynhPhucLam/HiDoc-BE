'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [
      {
        email: 'admin@gmail.com',
        password: '123456', //plain text (abcxyz123 => hash password)
        firstName: 'PhucLam',
        lastName: 'Yeah4420',
        address: 'VietNam',
        gender: 1,
        typeRole: 'ROLE',
        keyRole: 'R1',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  },
};
