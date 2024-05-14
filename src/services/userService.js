import db from '../models/index';
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPassword = await bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (e) {
      reject(e);
    }
  });
};

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

let getAllUsers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = '';
      if (userId === 'ALL') {
        users = await db.User.findAll({
          attributes: {
            exclude: ['password'],
          },
          raw: true,
        });
      }
      if (userId && userId !== 'ALL') {
        users = await db.User.findOne({
          where: { id: userId },
          attributes: {
            exclude: ['password'],
          },
          raw: true,
        });
      }
      resolve(users);
    } catch (error) {
      reject(error);
    }
  });
};

let createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // check if email exist?
      let check = await checkUserEmail(data.email);
      if (check === true) {
        resolve({
          errCode: 1,
          errMessage: 'Your email is already in used',
        });
      } else {
        let hashPasswordFromBcrypt = await hashUserPassword(data.password);
        await db.User.create({
          email: data.email,
          password: hashPasswordFromBcrypt,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phoneNumber: data.phoneNumber,
          gender: data.gender === '1' ? true : false,
          roleId: data.roleId,
        });
        resolve({
          errCode: 0,
          message: 'OK',
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: userId },
        raw: false,
      });
      if (!user) {
        resolve({
          errCode: 2,
          errMessage: `The user doesn't exist`,
        });
      }
      await user.destroy({
        where: { id: userId },
      });
      resolve({
        errCode: 0,
        errMessage: `The user is deleted`,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let updateUserData = (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userData.id) {
        resolve({
          errCode: 2,
          errMessage: `Missing required parameter`,
        });
      }
      let user = await db.User.findOne({
        where: { id: userData.id },
        raw: false,
      });
      if (user) {
        user.firstName = userData.firstName;
        user.lastName = userData.lastName;
        user.address = userData.address;
        await user.save();
        resolve({
          errCode: 0,
          message: `User's data Updated!`,
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: `User is not found`,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllcodeService = (typeInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!typeInput) {
        resolve({
          errCode: 1,
          errMessage: 'Missing require parameters',
        });
      } else {
        let response = {};
        let allcode = await db.Allcode.findAll({
          where: { type: typeInput },
        });
        response.errCode = 0;
        response.data = allcode;
        resolve(response);
      }
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  handleUserLogin: handleUserLogin,
  getAllUsers: getAllUsers,
  createNewUser: createNewUser,
  deleteUser: deleteUser,
  updateUserData: updateUserData,
  getAllcodeService: getAllcodeService,
};
