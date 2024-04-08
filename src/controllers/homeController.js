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

let displayGetCRUD = async (req, res) => {
  let data = await CRUDService.getAllUsers();
  console.log('------------');
  console.log(data);
  console.log('------------');
  return res.render('displayCRUD.ejs', {
    dataTable: data,
  });
};

let getEditCRUD = async (req, res) => {
  let userId = await req.query.id;
  console.log(userId);
  if (userId) {
    let userData = await CRUDService.getUserInfoById(userId);
    //
    //display edit crud view
    return res.render('editCRUD.ejs', {
      user: userData,
    });
  } else {
    return res.send('User is not found');
  }
};

let putCRUD = async (req, res) => {
  let data = req.body;
  let allUsers = await CRUDService.updateUserData(data);
  return res.render('displayCRUD.ejs', {
    dataTable: allUsers,
  });
};

module.exports = {
  getHomePage: getHomePage,
  getLamPage: getLamPage,
  getCRUD: getCRUD,
  postCRUD: postCRUD,
  displayGetCRUD: displayGetCRUD,
  getEditCRUD: getEditCRUD,
  putCRUD: putCRUD,
};
