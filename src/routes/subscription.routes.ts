import { Router } from "express";
import authorize from "../middlewares/auth.middleware";
import { createSubscription, getAllSubscriptions, getSubscriptionDetails, getUserSubscriptions } from "../controllers/subscription.controller";

const subscriptionRouter = Router();

subscriptionRouter.get('/', authorize, getAllSubscriptions);

subscriptionRouter.get('/:id', authorize, getSubscriptionDetails);;

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/:id', (req, res) => {res.send({title: 'UPDATE subscription'})});

subscriptionRouter.delete('/:id', (req, res) => {res.send({title: 'GET all subscriptions'})});

subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

subscriptionRouter.post('/:id/cancel', (req, res) => {res.send({title: 'CANCEL subscription'})});

subscriptionRouter.post('/upcoming-renewals', (req, res) => {res.send({title: 'GET upcoming renewals'})});

export default subscriptionRouter;