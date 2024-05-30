require('dotenv').config();
import nodemailer from 'nodemailer';
// const nodemailer = require('nodemailer');

let sendSimpleEmail = async (dataSend) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"HiDoc's Administrator" <nguyenphuclam105@gmail.com>`, // sender address
    to: dataSend.receiverEmail, // list of receivers
    subject: 'Thông tin đặt lịch khám bệnh', // Subject line
    html: getBodyHTMLEmail(dataSend), // html body
  });
};

let getBodyHTMLEmail = (dataSend) => {
  let result = '';
  if (dataSend.language === 'vi') {
    result = `
    <h3>Xin chào ${dataSend.patientName}!</h3>
    <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên HiDoc </p>
    <p>Thông tin đặt lịch khám bệnh:</p>
    <div><b>Thời gian khám bệnh: ${dataSend.time}</b></div>
    <div><b>Bác sĩ phụ trách khám: ${dataSend.doctorName}</b></div>
    <div>
         Nếu bạn đã xác nhận tất cả các thông tin trên, vui lòng click vào đường link bên dưới
         để hoàn tất thủ tục đặt lịch khám bệnh.
    </div>
    <div>
        <a href=${dataSend.redirectLink} target="_blank">Click here</a>
    </div>
    <div>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi !</div>
    `;
  }
  if (dataSend.language === 'en') {
    result = `
    <h3>Dear ${dataSend.patientName}!</h3>
    <p>You received this email because you booked an online medical appointment on HiDoc. </p>
    <p>Information of the medical appointment:</p>
    <div><b>Appointment Time: ${dataSend.time}</b></div>
    <div><b>The doctor in charge of the examination: ${dataSend.doctorName}</b></div>
    <div>
    If you have confirmed all of the above information is true, please click on the link below to complete the medical appointment booking procedure.
    </div>
    <div>
        <a href=${dataSend.redirectLink} target="_blank">Click here</a>
    </div>
    <div>Thank you for trusting to use our service !</div>
    `;
  }
  return result;
};

module.exports = {
  sendSimpleEmail: sendSimpleEmail,
};
