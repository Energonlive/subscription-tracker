import mongoose, {Document} from "mongoose";


interface ISubscription extends Document{
    _id: mongoose.Schema.Types.ObjectId,
    name: string;
    price: number;
    currency: string;
    frequency: string;
    category: string;
    paymentMethod: string;
    status: string;
    startDate: Date;
    renewalDate: Date;
    user: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subscription is required'],
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    price: {
        type:  Number,
        required: [true, 'Subscription price is requires'],
        min: [0, 'Price must be greater than 0'],
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'NGN'],
        default: 'USD'
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    category: {
        type: String,
        enum: ['sports', 'news', 'entertainment', 'lifestyle', 'technology', 'finance', 'politics', 'other'],
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired'],
        default: 'active'
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: (value: Date): boolean => value <= new Date(),
            message: 'Start date must be in the past'
        }
    },
    renewalDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value: Date):boolean {return value > this.startDate},
            message: 'Renewal date must be the after start date'
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, {timestamps: true});

subscriptionSchema.pre('validate', function(next){
    if(!this.renewalDate && this.frequency){
        this.renewalDate = new Date(this.startDate);

        switch (this.frequency){
            case 'daily':{
                this.renewalDate.setDate(this.renewalDate.getDate() + 1);
                break;
            }
            case 'weekly':{
                this.renewalDate.setDate(this.renewalDate.getDate() + 7);
                break;
            }
            case 'monthly':{
                const startDay = this.startDate.getDate();

                this.renewalDate.setMonth(this.renewalDate.getMonth() + 1);

                if(this.renewalDate.getDate() !== startDay) this.renewalDate.setDate(0);

                break;
            }
            case "yearly":{
                const startDay = this.startDate.getDate();
                this.renewalDate.setFullYear(this.renewalDate.getFullYear() + 1);
                if(this.renewalDate.getDate() !== startDay) this.renewalDate.setDate(0);
                break;
            }
            default:
                throw new Error(`Invalid frequency: ${this.frequency}`);
        }
    }
    
    next()
});

subscriptionSchema.pre("save", function(next){
    if (this.renewalDate < new Date()){
        this.status = 'expired';
    }

    next();
});

const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);

export default Subscription;