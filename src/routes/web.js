import express from 'express';
import homeController from '../controllers/homeController';
import userController from '../controllers/userController';
import doctorController from '../controllers/doctorController';
import patientController from '../controllers/patientController';
import specialtyController from '../controllers/specialtyController';
import medicineController from '../controllers/medicineController';

let router = express.Router();

let initWebRoutes = (app) => {
  router.get('/', homeController.getHomePage);
  router.get('/Lam', homeController.getLamPage);
  router.get('/crud', homeController.getCRUD);
  router.post('/post-crud', homeController.postCRUD);
  router.get('/get-crud', homeController.displayGetCRUD);
  router.get('/edit-crud', homeController.getEditCRUD);
  router.post('/put-crud', homeController.putCRUD);
  router.get('/delete-crud', homeController.deleteCRUD);

  router.post('/api/login', userController.handleLogin);
  router.get('/api/get-all-users', userController.handleGetAllUser);
  router.post('/api/create-new-user', userController.handleCreateNewUser);
  router.put('/api/edit-user', userController.handleEditUser);
  router.delete('/api/delete-user', userController.handleDeleteUser);

  router.get('/api/allcode', userController.getAllcode);

  router.get('/api/top-doctor-home', doctorController.getTopDoctorHome);
  router.get('/api/get-all-doctors', doctorController.getAllDoctors);
  router.post('/api/save-info-doctor', doctorController.postInfoDoctor);
  router.get(
    '/api/get-doctor-detail-by-id',
    doctorController.getDoctorDetailById
  );
  router.post('/api/bulk-create-schedule', doctorController.bulkCreateSchedule);
  router.get(
    '/api/get-schedule-doctor-by-date',
    doctorController.getScheduleByDate
  );
  router.get(
    '/api/get-extra-info-doctor-by-id',
    doctorController.getExtraInfoDoctorById
  );
  router.get(
    '/api/get-profile-doctor-by-id',
    doctorController.getProfileDoctorById
  );
  router.get(
    '/api/get-list-patient-for-doctor',
    doctorController.getListPatientForDoctor
  );

  router.post(
    '/api/patient-book-appointment',
    patientController.postBookAppointment
  );
  router.post(
    '/api/verify-book-appointment',
    patientController.postVerifyBookAppointment
  );
  router.post('/api/create-new-specialty', specialtyController.createSpecialty);
  router.get('/api/get-all-specialties', specialtyController.getAllSpecialties);
  router.get(
    '/api/get-detail-specialty-by-id',
    specialtyController.getDetailSpecialtyById
  );

  router.get(
    '/api/get-detail-specialty-by-id',
    specialtyController.getDetailSpecialtyById
  );
  router.post('/api/save-info-medicine', medicineController.postSaveMedicine);
  router.get('/api/get-patient-by-id', patientController.getPatientById);
  router.get('/api/get-all-medicines', medicineController.getAllMedicine);
  router.post(
    '/api/create-medical-report',
    medicineController.postSaveMedicalReport
  );
  router.get(
    '/api/get-all-medicines-of-patient-by-id',
    medicineController.getAllMedicinesOfPatientById
  );
  router.post('/api/save-patient-info', doctorController.postSavePatientInfo);
  router.get(
    '/api/get-patient-info-by-pid',
    doctorController.getPatientInfoByPId
  );
  router.post('/api/post-bill', patientController.postBill);
  router.post('/api/verify-bill', patientController.postVerifyBill);
  router.delete(
    '/api/delete-medical-report-by-patient-id',
    doctorController.deleteMedicalReportByPatientId
  );
  router.delete(
    '/api/delete-booking-by-patient-id',
    doctorController.deleteBookingByPatientId
  );

  return app.use('/', router);
};

module.exports = initWebRoutes;
