import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface IJwt {
    id: string,
    email: string;
    role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretaccesstokenhihi';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'mysecretrefreshtokenhihi'


//* generates Access Token.
export const generateAccessToken = (payload: IJwt): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1hr' });
};

//* generates Refresh Token.
export const generateRefreshToken = (payload: IJwt): string => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '4hr' });
};

//* verifies the Access Token.
export const verifyAccessToken = (token: string): JwtPayload | string => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        throw new Error('Access Token invalid or expired.')
    }
};

//* verifies the Refresh
export const verifyRefreshToken = (token: string): JwtPayload | string => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
        throw new Error('Refresh Token is invalid or expired.');
    }
}