import nodemailer from "nodemailer";
import { EMAIL_AUTH, EMAIL_PASSWORD } from "./env";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: EMAIL_AUTH as string,
        pass: EMAIL_PASSWORD as string
    },
    tls: {
        rejectUnauthorized: true,
    }
});

export default transporter;