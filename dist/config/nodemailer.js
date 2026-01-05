import nodemailer from "nodemailer";
import { EMAIL_AUTH, EMAIL_PASSWORD } from "./env";
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: EMAIL_AUTH,
        pass: EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: true,
    }
});
export default transporter;
