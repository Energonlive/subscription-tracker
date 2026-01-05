import mongoose, { Document, Types } from "mongoose";
import bcrypt from "bcryptjs";


interface IUser extends Document{
    _id: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User name is required'],
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'User Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 5,
        maxlength: 255,
        match: [/\S+@\S+\.\S+/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'User Password is required'],
        minlength: 6,
        select: false
    }
}, {timestamps: true});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    try{
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }catch(error){
        if (error instanceof Error){
            next(error);
        }else{
            next(new Error('Uknown error occurred'));
        }
    }
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
}

const User = mongoose.model<IUser>('User', userSchema)

export default User;