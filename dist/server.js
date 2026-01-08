import express from "express";
import cookieParser from "cookie-parser";
import { PORT, NODE_ENV } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/errors.middlware.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import workFlowRouter from "./routes/workflow.routes.js";
const app = express();

app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/health', (_, res) => res.status(200).send("OK"));

app.use(arcjetMiddleware);

app.get('/', (req, res) => {
    res.send("Welcome to the Subscription Tracker API");
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workFlowRouter);

app.use(errorMiddleware);


const startServer = async () => {
    try {
        if(!PORT) throw new Error('PORT is not defined');
        await connectToDatabase();
        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${NODE_ENV}`);
        });
    }
    catch (e) {
        console.error("Failed to start server:", e);
        process.exit(1);
    }
};
startServer();
