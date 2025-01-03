// mail.service.ts
import * as nodemailer from "nodemailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    async sendPasswordResetEmail(to: string, token: string) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const mailOptions = {
            from: "Auth-backend service",
            to: to,
            subject: "Password Reset Request",
            html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
        };

        await this.transporter.sendMail(mailOptions);
    }
}
