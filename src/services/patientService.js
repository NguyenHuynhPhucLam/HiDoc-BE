import db from '../models';
require('dotenv').config();
import { v4 as uuidv4 } from 'uuid';
import emailService from './emailService';

let buildUrlEmail = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};
let builBillLink = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/verify-bill-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};

let postBookAppointmentService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.timeType ||
        !data.date ||
        !data.fullName ||
        !data.selectedGender ||
        !data.address ||
        !data.phoneNumber ||
        !data.birthday
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing parameter',
        });
      } else {
        let token = uuidv4();
        await emailService.sendSimpleEmail({
          receiverEmail: data.email,
          patientName: data.fullName,
          time: data.timeString,
          doctorName: data.doctorName,
          language: data.language,
          redirectLink: buildUrlEmail(data.doctorId, token),
        });
        // Upsert patient
        let user = await db.User.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: 'R3',
            gender: data.selectedGender,
            address: data.address,
            phoneNumber: data.phoneNumber,
            firstName: data.fullName,
            birthday: data.birthday,
          },
        });

        // Create a booking record
        if (user && user[0]) {
          await db.Booking.findOrCreate({
            where: { patientId: user[0].id },
            defaults: {
              statusId: 'S1',
              doctorId: data.doctorId,
              patientId: user[0].id,
              date: data.date,
              timeType: data.timeType,
              token: token,
            },
          });
        }
        resolve({
          errCode: 0,
          errMessage: 'Save or create an appointment successfully!',
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let postVerifyBookAppointmentService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing parameter',
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: 'S1',
          },
          raw: false,
        });

        if (appointment) {
          appointment.statusId = 'S2';
          await appointment.save();
          resolve({
            errCode: 0,
            errMessage: 'The user has confirmed booking',
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: 'Appointment has been activated or does not exist',
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getPatientById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.User.findOne({
        where: { id: inputId, roleId: 'R3' },
        attributes: ['firstName', 'email'],
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
let postBill = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.appointmentDate ||
        !data.patientName ||
        !data.plusPrice ||
        !data.totalPrice ||
        !data.doctorPrice ||
        !data.receiverEmail ||
        !data.doctorId ||
        !data.patientId ||
        !data.unixDate
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing parameter',
        });
      } else {
        let token = uuidv4();
        await emailService.sendBillEmail({
          receiverEmail: data.receiverEmail,
          patientName: data.patientName,
          appointmentDate: data.appointmentDate,
          doctorPrice: data.doctorPrice,
          totalPrice: data.totalPrice,
          plusPrice: parseInt(data.doctorPrice) + parseInt(data.totalPrice),
          redirectLink: builBillLink(data.doctorId, token),
        });

        // Create a bill record
        await db.Bill.findOrCreate({
          where: { patientId: data.patientId },
          defaults: {
            patientId: data.patientId,
            patientName: data.patientName,
            plusPrice: parseInt(data.doctorPrice) + parseInt(data.totalPrice),
            totalPrice: data.totalPrice,
            doctorPrice: data.doctorPrice,
            appointmentDate: data.unixDate,
            token: token,
          },
        });
        // Update a booking record
        let booking = await db.Booking.findOne({
          where: { patientId: data.patientId, statusId: 'S2' },
          raw: false,
        });

        if (booking) {
          booking.token = token;
          await booking.save();
          resolve({
            errCode: 0,
            errMessage: 'Post bill success',
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: 'Bill has been confirmed or does not exist',
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

let postVerifyBill = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing parameter',
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: 'S2',
          },
          raw: false,
        });

        if (appointment) {
          await appointment.destroy();
          resolve({
            errCode: 0,
            errMessage: 'The user has confirmed bill',
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: 'Bill has been confirmed or does not exist',
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  postBookAppointmentService: postBookAppointmentService,
  postVerifyBookAppointmentService: postVerifyBookAppointmentService,
  getPatientById: getPatientById,
  postBill: postBill,
  postVerifyBill: postVerifyBill,
};
