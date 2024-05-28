import doctorService from '../services/doctorService';

let getTopDoctorHome = async (req, res) => {
  let limit = req.query.limit;
  if (!limit) limit = 10;
  try {
    let response = await doctorService.getTopDoctorHomeService(+limit);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server ...',
    });
  }
};
let getAllDoctors = async (req, res) => {
  try {
    let doctors = await doctorService.getAllDoctorsService();
    return res.status(200).json(doctors);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server ...',
    });
  }
};

let postInfoDoctor = async (req, res) => {
  try {
    let data = req.body;
    let response = await doctorService.saveInfoDoctorService(data);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server ...',
    });
  }
};
let getDoctorDetailById = async (req, res) => {
  try {
    let doctorId = req.query.id;
    let info = await doctorService.getDoctorDetailByIdService(doctorId);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server ...',
    });
  }
};

let bulkCreateSchedule = async (req, res) => {
  try {
    let data = req.body;
    let info = await doctorService.bulkCreateScheduleService(data);
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
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  postInfoDoctor: postInfoDoctor,
  getDoctorDetailById: getDoctorDetailById,
  bulkCreateSchedule: bulkCreateSchedule,
};
