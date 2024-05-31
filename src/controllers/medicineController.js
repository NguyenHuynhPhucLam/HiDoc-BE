import medicineService from '../services/medicineService';

let postSaveMedicine = async (req, res) => {
  try {
    let data = req.body;
    let info = await medicineService.postSaveMedicine(data);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server ...',
    });
  }
};

let getAllMedicine = async (req, res) => {
  try {
    let info = await medicineService.getAllMedicine();
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server ...',
    });
  }
};

let postSaveMedicalReport = async (req, res) => {
  try {
    let data = req.body;
    let info = await medicineService.postSaveMedicalReport(data);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server ...',
    });
  }
};

let getAllMedicinesOfPatientById = async (req, res) => {
  try {
    let id = req.query.patientId;
    let info = await medicineService.getAllMedicinesOfPatientById(id);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server ...',
    });
  }
};
module.exports = {
  postSaveMedicine: postSaveMedicine,
  getAllMedicine: getAllMedicine,
  postSaveMedicalReport: postSaveMedicalReport,
  getAllMedicinesOfPatientById: getAllMedicinesOfPatientById,
};
