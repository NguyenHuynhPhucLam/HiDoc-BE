import db from '../models';

let postSaveMedicine = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // check if email exist?
      if (!data.name || !data.amount || !data.unit) {
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
          gender: data.gender,
          roleId: data.roleId,
          positionId: data.positionId,
          image: data.avatar,
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

module.exports = {
  postSaveMedicine: postSaveMedicine,
};
