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

let checkRequiredFields = (inputData) => {
  let arrFields = [
    'doctorId',
    'contentHTML',
    'contentMarkdown',
    'action',
    'selectedPrice',
    'selectedPayment',
    'selectedProvince',
    'nameClinic',
    'addressClinic',
    'note',
    'specialtyId',
  ];
  let isValid = true;
  let element = '';
  for (let i = 0; i < arrFields.length; i++) {
    if (!inputData[arrFields[i]]) {
      isValid = false;
      element = arrFields[i];
      break;
    }
  }
  return {
    isValid: isValid,
    element: element,
  };
};

let saveInfoDoctorService = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let checkObj = checkRequiredFields(inputData);

      if (checkObj.isValid === false) {
        resolve({
          errCode: 1,
          errMessage: `Missing parameter: ${checkObj.element}`,
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
          doctorInfo.specialtyId = inputData.specialtyId;
          doctorInfo.clinicId = inputData.clinicId;
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
            specialtyId: inputData.specialtyId,
            clinicId: inputData.clinicId,
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
          where: {
            doctorId: parseInt(data.doctorId),
            date: data.formattedDate,
          },
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

let getListPatientForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameters',
        });
      } else {
        let data = await db.Booking.findAll({
          where: {
            statusId: 'S2',
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.User,
              as: 'patientData',
              attributes: [
                'email',
                'firstName',
                'address',
                'gender',
                'birthday',
                'phoneNumber',
              ],
              include: [
                {
                  model: db.Allcode,
                  as: 'genderData',
                  attributes: ['valueEn', 'valueVi'],
                },
              ],
            },
            {
              model: db.Allcode,
              as: 'timeTypeDataPatient',
              attributes: ['valueEn', 'valueVi'],
            },
          ],
          raw: false,
          nest: true,
        });

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

let postSavePatientInfo = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputData.patientId || !inputData.symptom || !inputData.diagnose) {
        resolve({
          errCode: 1,
          errMessage: `Missing parameter`,
        });
      } else {
        let data = await db.Patient_Info.findOrCreate({
          where: { patientId: inputData.patientId },
          defaults: {
            patientId: inputData.patientId,
            name: 'Patient',
            symptom: inputData.symptom,
            diagnose: inputData.diagnose,
          },
        });
        resolve({
          data: data,
          errCode: 0,
          errMessage: 'Save doctor information successfully',
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getPatientInfoByPId = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Patient_Info.findOne({
        where: { patientId: inputId },
        attributes: ['symptom', 'diagnose'],
      });

      if (!data) data = {};

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
let deleteMedicalReportByPatientId = async (userId, medicineId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.Medical_Report.findOne({
        where: { patientId: userId, medicineId: medicineId },
        raw: false,
      });
      if (user) {
        await user.destroy();
      }
      resolve({
        errCode: 0,
        errMessage: 'OK',
      });
    } catch (error) {
      reject(error);
    }
  });
};
let deleteBookingByPatientId = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let booking = await db.Booking.findOne({
        where: { patientId: userId },
        raw: false,
      });
      if (booking) {
        await booking.destroy();
      }
      resolve({
        errCode: 0,
        errMessage: 'OK',
      });
    } catch (error) {
      reject(error);
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
  getListPatientForDoctor: getListPatientForDoctor,
  postSavePatientInfo: postSavePatientInfo,
  getPatientInfoByPId: getPatientInfoByPId,
  deleteMedicalReportByPatientId: deleteMedicalReportByPatientId,
  deleteBookingByPatientId: deleteBookingByPatientId,
};
