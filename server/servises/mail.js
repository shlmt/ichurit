const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail =  (to,title,body)=>{
  const mailOptions = {
      from: 'תוכנת איחורית ⏰ <'+process.env.EMAIL_ADDRESS+'>' ,
      to: to,
      subject: title,
      html: body
  }
   return transporter.sendMail(mailOptions);
}


module.exports = sendEmail
