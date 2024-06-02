import db from '../models';

let postSaveMedicine = (input) => {
  return new Promise(async (resolve, reject) => {
    try {
      // check if email exist?
      if (!input.name || !input.unit || !input.pricePerUnit) {
        resolve({
          errCode: 1,
          errMessage: 'Your email is already in used',
        });
      } else {
        let data = await db.Medicine.create({
          name: input.name,
          pricePerUnit: input.pricePerUnit,
          unit: input.unit,
          usage: input.usage,
        });

        if (data)
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
let getAllMedicine = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Medicine.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      });
      if (data && data.length > 0) {
      }
      resolve({
        data: data,
        errCode: 0,
        message: 'OK',
      });
    } catch (error) {
      reject(error);
    }
  });
};

let postSaveMedicalReport = (input) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!input.patientId || !input.medicineId || !input.amount) {
        resolve({
          errCode: 1,
          errMessage: 'Your email is already in used',
        });
      } else {
        let data = await db.Medical_Report.create({
          patientId: input.patientId,
          medicineId: input.medicineId,
          amount: input.amount,
        });

        if (data)
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
let getAllMedicinesOfPatientById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Medical_Report.findAll({
        where: { patientId: inputId },
        attributes: ['medicineId', 'amount'],
      });

      resolve({
        errCode: 0,
        errMessage: 'OK',
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  postSaveMedicine: postSaveMedicine,
  getAllMedicine: getAllMedicine,
  postSaveMedicalReport: postSaveMedicalReport,
  getAllMedicinesOfPatientById: getAllMedicinesOfPatientById,
};
