import medicineService from '../services/medicineService';

let postSaveMedicine = async (req, res) => {
  try {
    let data = req.body;
    let info = await doctorService.postSaveMedicine(data);
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
};
