import { UserRole } from './defaults';

export interface FindPagination<T> {
    results: Promise<T[]>;
    total: Promise<number>;
}

export interface GoogleUserInfo {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
    locale: string;
    accessToken: string;
    refreshToken: string;
}

export interface Verification {
    email: string;
    verification_code: number;
    verification_code_expiration: Date;
}

export interface AuthorizedUserData {
    userId: string;
    username: string;
    role: UserRole;
}
