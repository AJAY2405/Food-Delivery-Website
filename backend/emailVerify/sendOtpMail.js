// import nodemailer from "nodemailer"
// import "dotenv/config"

// export const sendOtpMail = async(email, otp) =>{
//     const transporter = nodemailer.createTransport({
//         service:'gmail',
//         auth:{
//             user:process.env.MAIL_USER,
//             pass:process.env.MAIL_PASS
//         }
//     })

//     const mailOptions = {
//         from:process.env.MAIL_USER,
//         to:email,
//         subject:'Password reset OTP',
//         html:`<p>Your OTP for password reset is: <b>${otp}</b>. It is valid for 10 minutes.</p>`
//     }

//     await transporter.sendMail(mailOptions)
// }


import nodemailer from "nodemailer";
import "dotenv/config";


const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendOtpMail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Password reset OTP",
      html: `<p>Your OTP for password reset is: <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });

    console.log("OTP email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("sendOtpMail failed:", error.message);
    return { success: false, error: error.message };
  }
};