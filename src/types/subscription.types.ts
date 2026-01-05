export interface CreateSubscriptionRequestBody{
    name: string;
    price: number;
    currency: string;
    frequency: string;
    category: string;
    paymentMethod: string;
    status: string;
    startDate: Date;
}

export interface SubscriptionError extends Error{
    statusCode: number;
}