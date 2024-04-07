import db from '../models/index';
import CRUDService from '../services/CRUDService';
let getHomePage = async (req, res) => {
  try {
    let data = await db.User.findAll();
    console.log('-------------------');
    console.log(data);
    console.log('-------------------');
    return res.render('homePage.ejs', {
      data: JSON.stringify(data),
    });
  } catch (e) {
    console.log(e);
  }
};

let getLamPage = async (req, res) => {
  return res.send('Phuc Lam');
};

let getCRUD = async (req, res) => {
  return res.render('crud.ejs');
};
let postCRUD = async (req, res) => {
  let message = await CRUDService.createUser(req.body);
  console.log(message);
  return res.send('post crud from server');
};

module.exports = {
  getHomePage: getHomePage,
  getLamPage: getLamPage,
  getCRUD: getCRUD,
  postCRUD: postCRUD,
};
