import patientService from '../services/patientService';

let postBookAppointment = async (req, res) => {
  try {
    let data = req.body;
    let info = await patientService.postBookAppointmentService(data);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server ...',
    });
  }
};

let postVerifyBookAppointment = async (req, res) => {
  try {
    let data = req.body;
    let info = await patientService.postVerifyBookAppointmentService(data);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server ...',
    });
  }
};
let getPatientById = async (req, res) => {
  try {
    let info = await patientService.getPatientById(req.query.patientId);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from the server',
    });
  }
};
let postBill = async (req, res) => {
  try {
    let data = req.body;
    let info = await patientService.postBill(data);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server ...',
    });
  }
};

let postVerifyBill = async (req, res) => {
  try {
    let data = req.body;
    let info = await patientService.postVerifyBill(data);
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
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
  getPatientById: getPatientById,
  postBill: postBill,
  postVerifyBill: postVerifyBill,
};
