import { Request, Response } from "express";
import userModel, { IUser } from "../models/user.model";
import { verifyAccessToken } from "../utils/jwt.utils";


export const saveAdmin = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, email, password } = req.body;

        const admins = await userModel.find({ role: { $ne: 'user' } });

        if (admins.some(admin => admin.email === email)) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        const newAdmin = new userModel({
            username,
            email,
            password
        });

        if (admins.some(admin => admin.role === 'master')) {
            newAdmin.role = 'admin';
        } else {
            newAdmin.role = 'master';
        }

        newAdmin.save();

        return res.status(201).json({ message: 'Admin has been registered successfully.' });
    } catch (err: any) {
        console.error(`Error in saveAdmin: ${err.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: err.message
        });
    }
};

export const getAdmin = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;

    try {
        const admin = await userModel.findOne({ email, role: { $ne: 'user' } });
        if (!admin) {
            return res.status(404).json({ message: 'admin doesn\'t exists.' });
        }

        const token = req.cookies['adminToken'];
        const adminAccessToken = JSON.parse(token);
        if (!adminAccessToken) {
            return res.status(404).json({ message: 'Token not found.' });
        }

        const isVerified = verifyAccessToken(adminAccessToken);
        if (!isVerified) {
            return res.status(400).json({ message: 'Token expired.' });
        }

        return res.status(200).json({
            adminToken: adminAccessToken,
            admin: {
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (err: any) {
        console.error(`Error in getAdmin: ${err.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: err.message
        });
    }
}

export const loadAdmins = async (req: Request, res: Response): Promise<any> => {
    try {
        const admins = await userModel.find({ role: { $nin: ['user', 'master'] } });
        return res.status(200).json({ admins });
    } catch (err: any) {
        console.error(`Error in loadAdmins: ${err.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: err.message
        });
    }
}

export const updateStatus = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;

    try {
        await userModel.findOneAndUpdate(
            { email },
            [
                { $set: { isBlocked: { $not: '$isBlocked' } } }
            ],
            { new: true }
        );
        return res.status(200).json({ message: 'status changed successfully.' });
    } catch (err: any) {
        console.error(`Error in updateStatus @ admin: ${err.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: err.message
        });
    }
}
