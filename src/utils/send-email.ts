import { emailTemplates } from "./email-template";
import type { EmailTemplateParams, sendReminderParams } from '../types/workflow.types';
import dayjs from "dayjs";
import { EMAIL_AUTH } from "../config/env";
import type { MailOptions } from "nodemailer/lib/json-transport";
import transporter from "../config/nodemailer";



export const sendReminderEmail = async ({to, type, subscription}: sendReminderParams) => {
    if(!to || !type) throw new Error('Missing required parameters');

    const template = emailTemplates.find((t) => t.label === type);

    if(!template) throw new Error('Invalid email type');
    
    const mailInfo: EmailTemplateParams = {
        userName: subscription.user.name,
        subscriptionName: subscription.name,
        renewalDate: dayjs(subscription.renewalDate).format('dddd, MMMM D, YYYY'),
        planName: subscription.name,
        price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
        paymentMethod: subscription.paymentMethod
    }

    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    const mailOptions: MailOptions = {
        from: EMAIL_AUTH,
        to: to,
        subject: subject,
        html: message
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) return console.error(error, 'Error sending email');

        console.log('Email sent: ' + info.response);
    })
};