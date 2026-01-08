import Subscription from "../models/subscription.model.js";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";
export const createSubscription = async (req, res, next) => {
    try {
        const body = (req.body || {});
        const subscription = await Subscription.create({
            ...body,
            user: req.user?._id,
        });
        const { workflowRunId } = await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription.id
            },
            headers: {
                'content-type': 'application/json'
            },
            retries: 0
        });
        res.status(201).json({ success: true, data: { subscription, workflowRunId } });
    }
    catch (error) {
        next(error);
    }
};
export const getUserSubscriptions = async (req, res, next) => {
    try {
        const userId = req.user?._id.toString();
        if (userId !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.statusCode = 401;
            throw error;
        }
        const subscriptions = await Subscription.find({ user: req.params.id });
        res.status(200).json({ success: true, data: subscriptions });
    }
    catch (error) {
        next(error);
    }
};
export const getAllSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find();
        res.status(200).json({
            success: true,
            data: subscriptions
        });
    }
    catch (error) {
        next(error);
    }
};
export const getSubscriptionDetails = async (req, res, next) => {
    try {
        const subscriptionDetails = await Subscription.findById(req.params.id);
        res.status(200).json({
            success: true,
            data: subscriptionDetails
        });
    }
    catch (error) {
        next(error);
    }
};
