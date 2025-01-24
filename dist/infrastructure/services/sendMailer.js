"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class sendotp {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: "mujithabaep772@gmail.com",
                pass: process.env.maile_Pass,
            },
        });
    }
    // user verification otp mail
    sendMail(name, email, otp, role) {
        const mailoptions = {
            from: "muj@gmail.com",
            to: email,
            subject: `Coursa Tech Email verification for ${role}`,
            html: `<p>Dear ${name},</p>
                   <p><b>Your verification OTP is: ${otp}</b></p>
                   <p>Thank you,<br/>CoursaTech Team</p>`,
        };
        this.transporter.sendMail(mailoptions, (err) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log("verification code sent successfully");
            }
        });
    }
    // informing the course deleted bcz of continues reports
    sendCourseDeleteMail(email, name, courseName) {
        const mailOptions = {
            from: "muj@gmail.com",
            to: email,
            subject: `Course Removal Notification: ${courseName}`,
            html: `
                <p>Dear ${name},</p>
                <p>We regret to inform you that your course titled <b>"${courseName}"</b> has been deleted from our platform due to continuous reports and violations of our community guidelines.</p>
                <p>If you believe this was a mistake or if you have any questions, please contact our support team.</p>
                <p>Thank you for your understanding.</p>
                <p>Best regards,<br/><b>CoursaTech Team</b></p>
            `,
        };
        this.transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error("Error sending course deletion email:", err);
            }
            else {
                console.log("Course deletion email sent successfully");
            }
        });
    }
}
exports.default = sendotp;
