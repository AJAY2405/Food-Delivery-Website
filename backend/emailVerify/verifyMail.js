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

// Built once, reused for every call instead of recreated every send —
// createTransport() is cheap but there's no reason to pay it per email.
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
    // Log and return — never throw here. This function is called from
    // registerUser without being awaited/caught there, so an uncaught
    // throw becomes an unhandled exception that crashes the whole
    // Node process (exactly what happened on Render). A failed email
    // should mean "the user can request a resend later", not "every
    // other request on the server goes down too".
    console.error("verifyMail failed:", error.message);
    return { success: false, error: error.message };
  }
};