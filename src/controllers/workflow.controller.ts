import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');
import dayjs from "dayjs";
import Subscription from "../models/subscription.model";
import type { WorkflowContext } from "@upstash/workflow";
import type { SendRemindersPayload, WorkFlowSubscription } from '../types/workflow.types';
import { sendReminderEmail } from "../utils/send-email";


const REMINDERS: number[] = [7, 5, 2, 1]; 

export const sendReminders = serve(async (context: WorkflowContext<SendRemindersPayload>)=>{
    const {subscriptionId} = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId);

    if(!subscription || subscription.status !== 'active') return;

    const renewalDate = dayjs(subscription.renewalDate);

    if(renewalDate.isBefore(dayjs())){
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
        return;
    }

    for(const daysBefore of REMINDERS){
        const label = `${daysBefore} ${daysBefore === 1 ? "day" : "days"} before reminder`;
        const reminderDate = renewalDate.subtract(daysBefore, 'day');

        
        await sleepUntilReminder(context, label, reminderDate.toDate());

        
        await triggerReminder(context, label, subscriptionId, reminderDate);
    }
});


const fetchSubscription = async (context: WorkflowContext<SendRemindersPayload>, subscriptionId: string) => {
    return await context.run('get subscription', async () => {
        const sub =  Subscription.findById(subscriptionId).populate('user', 'name email').lean<WorkFlowSubscription>();
        return sub;
    });
};

const sleepUntilReminder = async (context: WorkflowContext<SendRemindersPayload>, label: string, date: Date) => {
    console.log(`Sleeping until ${label} at ${date}`);
    await context.sleepUntil(label, date);
}

const triggerReminder = async (context: WorkflowContext<SendRemindersPayload>, label: string, subscriptionId: string, reminderDate: dayjs.Dayjs) => {
    return await context.run(label, async () => {

        const subscription = await Subscription.findById(subscriptionId).populate('user', 'name email').lean<WorkFlowSubscription>();

        if(!subscription || subscription.status !== "active"){
            console.log(`Skipping ${label}, subscription no longer active`);
            return;
        }

        const GRACE_MINUTES = 5;
        const isSameDay = dayjs().isSame(reminderDate, "day")
        const minutesLate = dayjs().diff(reminderDate, 'minute');

        if(!isSameDay){
            console.log(`Skipping ${label}, not reminder day`);
            return;
        }

        if (minutesLate < 0 || minutesLate > GRACE_MINUTES){
            console.log(`Skipping ${label}, ${ minutesLate} minutes late`);
            return;
        }

        console.log(`Triggering ${label}`);

        await sendReminderEmail({
            to: subscription.user.email,
            type: label,
            subscription
        })
    });
}

