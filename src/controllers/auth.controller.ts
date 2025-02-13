import { Request, Response, NextFunction } from 'express';
import argon2 from 'argon2';

import { generateAccessToken, generateRefreshToken, IJwt, verifyAccessToken } from '../utils/jwt.utils';
import userModel from '../models/user.model';

const generateTokens = (user: any) => {
    const accessToken = generateAccessToken({ id: user._id.toString(), email: user.email, role: user.role }); // 1hr
    const refreshToken = generateRefreshToken({ id: user._id.toString(), email: user.email, role: user.role });// 4hr
    return {
        accessToken,
        refreshToken
    }
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, password } = req.body;

    try {
        //* checks if the user exists.
        const user = await userModel.findOne({ email, role: 'user' });
        if (!user) {
            return res.status(400).json({ message: 'User not found\n Invalid Email' });
        }

        //* check if the passwords match.
        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password.' });
        }

        if (user.isBlocked) {
            return res.status(401).json({ message: 'You are blocked by the user.' });
        }

        const { accessToken, refreshToken } = generateTokens(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('userToken', JSON.stringify(accessToken), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            accessToken,
            user: {
                email: user.email,
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
                isBlocked: user.isBlocked
            }
        });

    } catch (err: any) {
        console.error(`Error in extractFilePath: ${err.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: err.message
        });
    }
};


export const adminLogin = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        const admin = await userModel.findOne({ email, role: { $ne: 'user' } });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const isMatch = await argon2.verify(admin.password, password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password doesn\'t match.' });
        }

        const { accessToken, refreshToken } = generateTokens(admin);

        admin.refreshToken = refreshToken;
        await admin.save();

        res.cookie('adminToken', JSON.stringify(accessToken), {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            accessToken,
            admin: {
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (err: any) {
        console.error(`Error in adminLogin: ${err.message}`);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: err.message
        });
    }
}

export const verifyToken = async (req: Request, res: Response): Promise<any> => {
    try {
        const token = req.cookies?.userToken;
        const isVerified = verifyAccessToken(JSON.parse(token));
        console.log(isVerified);

        if (!isVerified) {
            return res.status(401).json({ success: false, message: 'This end point is not authorized for access.' })
        }

        return res.status(200).json({ success: true, message: 'You are authorized to to access' });

    } catch (err: any) {
        console.error(`Error in verifyToken: ${err.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: err.message
        });
    }


}


export const getToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { cookieName } = req.query;

        const token = req.cookies['userToken'];

        if (!token) {
            return res.status(404).json({ token: null });
        }

        return res.status(200).json({ token: JSON.parse(token) });

    } catch (err: any) {
        console.error(`Error in getToken: ${err.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: err.message
        });
    }
}


export const logout = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    console.log(req.query);

    const tokenValue = req.query.tokenValue as string;
    try {
        console.log(tokenValue);

        res.clearCookie(tokenValue);

        // const reslt = req.cookies[JSON.parse(tokenValue)]
        // console.log(reslt);

        return res.status(200).json({ message: 'User logged out.' });

    } catch (error: any) {
        console.error(`Error in logout: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

