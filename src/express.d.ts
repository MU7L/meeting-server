// express.d.ts

export declare global {
    namespace Express {
        interface Request {
            user?: User;
        }

        interface User {
            id: number;
            email: string;
            password: string;
            captcha: string;
        }
    }
}
