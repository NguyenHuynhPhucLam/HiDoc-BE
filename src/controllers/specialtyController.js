import specialtyService from '../services/specialtyService';

let createSpecialty = async (req, res) => {
  try {
    let data = req.body;
    let info = await specialtyService.createSpecialtyService(data);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from the server',
    });
  }
};

module.exports = {
  createSpecialty: createSpecialty,
};
