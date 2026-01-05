export interface SignUpRequestBody {
    name: string;
    email: string;
    password: string
}

export type SignInRequestBody = Omit<SignUpRequestBody, "name">

export interface AuthenticationError extends Error {
    statusCode: number;
}

