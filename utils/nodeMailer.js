const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'alangomez6678@gmail.com',
    pass: process.env.GOOGLE_AUTH
  }
});

const mailOptions = {
  from: 'alangomez6678@gmail.com',
  to: '',
  subject: 'Order Confirmation!',
  text: 'Your order has been confirmed'
};

module.exports = {
  mailOptions,
  sendMail: ()=>{
      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error, "{{{{{{{{");
          } else {
            console.log('Email sent: ' + info.response);
          }
      });
  }
}

