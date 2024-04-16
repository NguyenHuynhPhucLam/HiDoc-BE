import db from '../models/index';
import bcrypt from 'bcryptjs';

let handleUserLogin = (userEmail, userPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(userEmail);
      if (isExist) {
        // user already exist
        let user = await db.User.findOne({
          where: { email: userEmail },
          attributes: ['email', 'roleId', 'password'],
          raw: true,
        });
        if (user) {
          // compare password
          let check = await bcrypt.compareSync(userPassword, user.password);
          if (check) {
            userData.errCode = 0;
            userData.errMessage = 'OK';
            delete user.password;
            userData.user = user;
          } else {
            userData.errCode = 3;
            userData.errMessage = 'Wrong Password';
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = 'User is not found';
        }
      } else {
        // return error
        userData.errCode = 1;
        userData.errMessage = "Your Email doesn't exist in our System";
      }

      resolve(userData);
    } catch (error) {
      reject(error);
    }
  });
};

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: userEmail },
      });

      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let compareUserPassword = (userPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  handleUserLogin: handleUserLogin,
  checkUserEmail: checkUserEmail,
};
