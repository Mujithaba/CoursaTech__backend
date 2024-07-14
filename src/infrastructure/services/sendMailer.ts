import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

class sendotp {
    transporter: nodemailer.Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "mujithabaep772@gmail.com",
                pass: process.env.maile_Pass,
            },
        });
    }

    // user verification otp mail
    sendMail(name:string,email: string, otp: number,role:string): void {
        const mailoptions: nodemailer.SendMailOptions = {
            from: "muj@gmail.com",
            to: email,
            subject: `Coursa Tech Email verification for ${role}`,
            // text: `${email}, your verification code is: ${otp}`,
            html: `<p>Dear ${name},</p>
                   <p><b>Your verification OTP is: ${otp}</b></p>
                   <p>Thank you,<br/>CoursaTech Team</p>`,
        };
        this.transporter.sendMail(mailoptions, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("verification code sent successfully");
            }
        });
    }
}

export default sendotp;
