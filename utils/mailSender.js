const nodemailer = require("nodemailer");

exports.mailSender = async (email, title, body) => {
  try {
    //creating transporter
    const transporter = await nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: "StudyNotion - By kshitij",
      to: email,
      subject: title,
      html: body,
    };

    //send mail
    let info = await transporter.sendMail(mailOptions);

    console.log(info);
    return info;
  } catch (e) {
    console.log("Issue in sending the mail");
    console.error(e);
    throw e;
  }
};
