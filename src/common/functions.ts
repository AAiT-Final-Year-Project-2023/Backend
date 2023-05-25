import { CodeExpiration } from './defaults';

export const isValidUUID = (value: string) => {
    const regexExp =
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    return regexExp.test(value);
};

export const enumToString = (value: Record<string, string> | string[]) => {
    if (Array.isArray(value)) {
        return value.join(', ');
    } else if (typeof value === 'object') {
        return Object.values(value).join(', ');
    } else {
        return '';
    }
};

export const generateCodeAndExpiration = () => {
    const verificationCode = Math.floor(
        100000 + Math.random() * 900000,
    ).toString();
    const expiresIn = new Date();
    expiresIn.setMinutes(
        expiresIn.getMinutes() + CodeExpiration.email_verification,
    );

    return {
        verificationCode,
        expiresIn,
    };
};
