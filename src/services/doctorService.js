import _, { includes, reject } from 'lodash';
import db from '../models/index';
import { where } from 'sequelize';
require('dotenv').config();

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHomeService = (limitInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limitInput,
        where: { roleId: 'R2' },
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password'] },
        include: [
          {
            model: db.Allcode,
            as: 'positionData',
            attributes: ['valueEn', 'valueVi'],
          },
          {
            model: db.Allcode,
            as: 'genderData',
            attributes: ['valueEn', 'valueVi'],
          },
        ],
        raw: true,
        nest: true,
      });

      resolve({
        errCode: 0,
        data: users,
      });
    } catch (e) {
      reject(e);
    }
  });
};
let getAllDoctorsService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleId: 'R2' },
        attributes: {
          exclude: ['password', 'image'],
        },
      });
      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (e) {
      reject(e);
    }
  });
};
let saveInfoDoctorService = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !inputData.doctorId ||
        !inputData.contentHTML ||
        !inputData.contentMarkdown ||
        !inputData.action ||
        !inputData.selectedPrice ||
        !inputData.selectedPayment ||
        !inputData.selectedProvince ||
        !inputData.nameClinic ||
        !inputData.addressClinic ||
        !inputData.note
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing parameter',
        });
      } else {
        // Upsert to Markdown table
        if (inputData.action === 'CREATE') {
          await db.Markdown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            doctorId: inputData.doctorId,
          });
        } else if (inputData.action === 'EDIT') {
          let doctorMarkdown = await db.Markdown.findOne({
            where: { doctorId: inputData.doctorId },
            raw: false,
          });

          if (doctorMarkdown) {
            doctorMarkdown.contentHTML = inputData.contentHTML;
            doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
            doctorMarkdown.description = inputData.description;

            await doctorMarkdown.save();
          }
        }

        // Upsert to Doctor_Info
        let doctorInfo = await db.Doctor_Info.findOne({
          where: {
            doctorId: inputData.doctorId,
          },
          raw: false,
        });

        if (doctorInfo) {
          // update
          doctorInfo.doctorId = inputData.doctorId;
          doctorInfo.priceId = inputData.selectedPrice;
          doctorInfo.provinceId = inputData.selectedProvince;
          doctorInfo.paymentId = inputData.selectedPayment;
          doctorInfo.nameClinic = inputData.nameClinic;
          doctorInfo.addressClinic = inputData.addressClinic;
          doctorInfo.note = inputData.note;
          await doctorInfo.save();
        } else {
          // create
          await db.Doctor_Info.create({
            doctorId: inputData.doctorId,
            priceId: inputData.selectedPrice,
            provinceId: inputData.selectedProvince,
            paymentId: inputData.selectedPayment,
            nameClinic: inputData.nameClinic,
            addressClinic: inputData.addressClinic,
            note: inputData.note,
          });
        }
        resolve({
          errCode: 0,
          errMessage: 'Save doctor information successfully',
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getDoctorDetailByIdService = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: 'Cannot get doctor by Id: Missing doctocId',
        });
      } else {
        let data = await db.User.findOne({
          where: { id: inputId },
          attributes: {
            exclude: ['password'],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ['description', 'contentHTML', 'contentMarkdown'],
            },
            {
              model: db.Allcode,
              as: 'positionData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.Doctor_Info,
              attributes: {
                exclude: ['id', 'doctorId'],
              },
              include: [
                {
                  model: db.Allcode,
                  as: 'priceTypeData',
                  attributes: ['valueEn', 'valueVi'],
                },
                {
                  model: db.Allcode,
                  as: 'provinceTypeData',
                  attributes: ['valueEn', 'valueVi'],
                },
                {
                  model: db.Allcode,
                  as: 'paymentTypeData',
                  attributes: ['valueEn', 'valueVi'],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });

        if (data && data.image) {
          data.image = new Buffer(data.image, 'base64').toString('binary');
        }
        if (!data) data = {};

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let bulkCreateScheduleService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.doctorId || !data.formattedDate) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameters',
        });
      } else {
        let schedules = data.arrSchedule;
        if (schedules && schedules.length > 0) {
          schedules = schedules.map((item) => {
            item.maxNumber = MAX_NUMBER_SCHEDULE;
            return item;
          });
        }

        // Get all existing data
        let existing = await db.Schedule.findAll({
          where: { doctorId: data.doctorId, date: data.formattedDate },
          attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
          raw: true,
        });

        // Compare different
        let toCreate = _.differenceWith(schedules, existing, (a, b) => {
          return a.timeType === b.timeType && +a.date === +b.date;
        });

        // Create data
        if (toCreate && toCreate.length > 0) {
          await db.Schedule.bulkCreate(toCreate);
        }

        resolve({
          errCode: 0,
          errMessage: 'OK',
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getScheduleByDateService = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameters',
        });
      } else {
        let dataSchedule = await db.Schedule.findAll({
          where: {
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.Allcode,
              as: 'timeTypeData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.User,
              as: 'doctorData',
              attributes: ['firstName', 'lastName'],
            },
          ],
          raw: false,
          nest: true,
        });

        if (!dataSchedule) dataSchedule = [];
        resolve({
          errCode: 0,
          data: dataSchedule,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getExtraInfoDoctorByIdService = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: 'Cannot get doctor by Id: Missing doctocId',
        });
      } else {
        let data = await db.Doctor_Info.findOne({
          where: {
            doctorId: inputId,
          },
          attributes: {
            exclude: ['id', 'doctorId'],
          },
          include: [
            {
              model: db.Allcode,
              as: 'priceTypeData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.Allcode,
              as: 'provinceTypeData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.Allcode,
              as: 'paymentTypeData',
              attributes: ['valueEn', 'valueVi'],
            },
          ],
          raw: false,
          nest: true,
        });

        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getProfileDoctorByIdService = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: 'Cannot get doctor by Id: Missing doctocId',
        });
      } else {
        let data = await db.User.findOne({
          where: { id: inputId },
          attributes: {
            exclude: ['password'],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ['description', 'contentHTML', 'contentMarkdown'],
            },
            {
              model: db.Allcode,
              as: 'positionData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.Doctor_Info,
              attributes: {
                exclude: ['id', 'doctorId'],
              },
              include: [
                {
                  model: db.Allcode,
                  as: 'priceTypeData',
                  attributes: ['valueEn', 'valueVi'],
                },
                {
                  model: db.Allcode,
                  as: 'provinceTypeData',
                  attributes: ['valueEn', 'valueVi'],
                },
                {
                  model: db.Allcode,
                  as: 'paymentTypeData',
                  attributes: ['valueEn', 'valueVi'],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });

        if (data && data.image) {
          data.image = new Buffer(data.image, 'base64').toString('binary');
        }
        if (!data) data = {};

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  getTopDoctorHomeService: getTopDoctorHomeService,
  getAllDoctorsService: getAllDoctorsService,
  saveInfoDoctorService: saveInfoDoctorService,
  getDoctorDetailByIdService: getDoctorDetailByIdService,
  bulkCreateScheduleService: bulkCreateScheduleService,
  getScheduleByDateService: getScheduleByDateService,
  getExtraInfoDoctorByIdService: getExtraInfoDoctorByIdService,
  getProfileDoctorByIdService: getProfileDoctorByIdService,
};
