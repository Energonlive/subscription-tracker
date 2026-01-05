import mongoose from "mongoose";
import { DB_URI } from "../config/env";
if (!DB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.<development/production>.local');
}
const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 90000
};
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const connectToDatabase = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            await mongoose.connect(DB_URI, options);
            console.log('Connected to MongoDB');
            setupConnectionListeners();
            return;
        }
        catch (e) {
            retries++;
            console.error(`Error connecting to database on attempt ${retries}/${MAX_RETRIES}: `, e);
            if (retries < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY / 1000}S...`);
                await sleep(RETRY_DELAY);
            }
            else {
                throw new Error('Failed to connect to mongoDB after 3 tries');
            }
        }
    }
};
const setupConnectionListeners = () => {
    if (mongoose.connection.listenerCount('error') > 0) {
        return;
    }
    mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to mongoDB');
    });
    mongoose.connection.on('error', (err) => {
        console.log('Mongoose connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose disconnected from mongoDB');
    });
    mongoose.connection.on('reconnected', () => {
        console.log('Mongoose reconnected to mongoDB');
    });
};
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Closing MongoDB connection...`);
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed gracefully');
        process.exit(0);
    }
    catch (err) {
        console.error('Error during graceful shutdown:', err);
        process.exit(1);
    }
};
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
export default connectToDatabase;
