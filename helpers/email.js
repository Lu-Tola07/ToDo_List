require("dotenv").config();
const nodeMailer = require("nodemailer");

const sendMail = async (options) => {
    const transporter = await nodeMailer.createTransport({
        secure: true,
        service: process.env.SERVICE,
        auth: {
            user: process.env.mailUser,
            pass: process.env.mailPassword
        }
    });

let mailOptions = {
    from: process.env.mailUser,
    to: options.email,
    subject: options.subject,
    //text: options.message,
    html: options.html
}

await transporter.sendMail(mailOptions);

};

module.exports = sendMail;