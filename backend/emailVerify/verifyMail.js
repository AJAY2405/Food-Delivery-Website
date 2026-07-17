// import nodemailer from "nodemailer";
// import "dotenv/config";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import handlebars from "handlebars";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const verifyMail = async (token, email) => {
//   const emailTemplateSource = fs.readFileSync(
//     path.join(__dirname, "template.hbs"),
//     "utf-8"
//   );

//   const template = handlebars.compile(emailTemplateSource);
//   const htmlToSend = template({ token: encodeURIComponent(token) });

//   // const transporter = nodemailer.createTransport({
//   //     service: 'gmail',
//   //     auth: {
//   //         user: process.env.MAIL_USER,
//   //         pass: process.env.MAIL_PASS
//   //     }
//   // })

//   const transporter = nodemailer.createTransport({
//     host: process.env.MAIL_HOST,
//     port: process.env.MAIL_PORT,
//     secure: false, 
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS,
//     },
//     tls: {
//       rejectUnauthorized: false, 
//     },
//   });

//   const mailConfigurations = {
//     from: process.env.MAIL_USER,
//     to: email,
//     subject: "Email Verification",
//     html: htmlToSend,
//   };

//   transporter.sendMail(mailConfigurations, function (error, info) {
//     if (error) {
//       throw new Error(error);
//     }
//     console.log("Email sent successfully");
//     console.log(info);
//   });
// };



import nodemailer from "nodemailer";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(process.env.MAIL_HOST);
console.log(process.env.MAIL_PORT);
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,


  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const verifyMail = async (token, email) => {
  try {
    const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, "template.hbs"),
      "utf-8"
    );

    const template = handlebars.compile(emailTemplateSource);
    const htmlToSend = template({ token: encodeURIComponent(token) });

    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Email Verification",
      html: htmlToSend,
    });

    console.log("Verification email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("verifyMail failed:", error.message);
    return { success: false, error: error.message };
  }
};