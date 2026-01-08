import User from "../models/user.model.js";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const body = (req.body || {});
        const { name, email, password } = body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }
        const newUsers = await User.create([{ name, email, password }], { session });
        const newUser = newUsers[0];
        if (!newUser) {
            throw new Error("Failed to create new user");
        }
        const payload = { userId: newUser._id.toString() };
        const secret = JWT_SECRET;
        const token = jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
        const newUserObject = newUser.toObject();
        delete newUserObject.password;
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: newUser
            }
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};
export const signIn = async (req, res, next) => {
    try {
        const body = (req.body || {});
        const { email, password } = body;
        if (!email) {
            const error = new Error('Email is required');
            error.statusCode = 400;
            throw error;
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        if (!password) {
            const error = new Error('Password is required');
            error.statusCode = 400;
            throw error;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            const error = new Error('Invalid Password');
            error.statusCode = 401;
            throw error;
        }
        const payload = { userId: user._id.toString() };
        const secret = JWT_SECRET;
        const options = {
            expiresIn: JWT_EXPIRES_IN
        };
        const token = jwt.sign(payload, secret, options);
        const userObject = user.toObject();
        delete userObject.password;
        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: {
                token,
                user: userObject
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const signOut = async (req, res, next) => {
};
