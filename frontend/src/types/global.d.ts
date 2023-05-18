import { NextApiRequest } from 'next';
import { Session } from 'next-iron-session';

export { };

declare global {
    export type NextIronRequest = NextApiRequest & {
        session: Session;
    };
    //user info with token info
    interface Token {
        access_token?: string;
        refresh_token?: string;
        csrf_token?: string;
    }
    interface User{
        id: string;
        username: string;
        birthday: string;
        last_login: string;
    }

    export interface UserStatus {
        isAuthenticated?: boolean;
        user?: User;
        token?: Token;
    }
}