import { Types } from "mongoose";


// Workflow Controller (../controllers/workflow.contoller.ts)
export interface SendRemindersPayload{
    subscriptionId: string;
}

// Email Template Utily (../utils/email-templates.ts)
export interface EmailTemplateParams{
    userName: string;
    subscriptionName: string;
    renewalDate: string;
    planName: string;
    price: string;
    paymentMethod: string;
    accountSettingsLink?: string;
    supportLink?: string;
    daysLeft?: number;
}

interface EmailTemplatesStructure{
    label: string;
    generateSubject: (data: EmailTemplateParams) => string;
    generateBody: (data: EmailTemplateParams) => string;
}

export type emailTemplatesType = EmailTemplatesStructure[]

// Send Email Utility (../utils/send-emails.ts)
export interface WorkFlowSubscription{
    _id: Types.ObjectId,
    name: string;
    price: number;
    currency: string;
    frequency: string;
    category: string;
    paymentMethod: string;
    status: string;
    startDate: Date;
    renewalDate: Date;
    user: {
        _id: Types.ObjectId;
        name: string;
        email: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface sendReminderParams{
    to: string;
    type: string;
    subscription: WorkFlowSubscription;
}