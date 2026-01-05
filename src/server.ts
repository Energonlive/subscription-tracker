import express from "express";
import cookieParser from "cookie-parser";
import 'dotenv/config';
import { PORT, NODE_ENV } from "./config/env";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import subscriptionRouter from "./routes/subscription.routes";
import connectToDatabase from "./database/mongodb";
import errorMiddleware from "./middlewares/errors.middlware";
import arcjetMiddleware from "./middlewares/arcjet.middleware";
import workFlowRouter from "./routes/workflow.routes";




const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(arcjetMiddleware);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workFlowRouter);


app.use(errorMiddleware);

app.get('/', (req, res) => {
    res.send("Welcome to the Subscription Tracker API");
});

const startServer = async () => {
    try {
        await connectToDatabase();
        app.listen(PORT, () => {
            console.log(`Subscription Tracker API is running on http://localhost:${PORT}`);
            console.log(`Connected to database in ${NODE_ENV} mode `);
        })
    }catch(e){
        console.error("Failed to start server:", e);
        process.exit(1);
    }
} 

startServer();
