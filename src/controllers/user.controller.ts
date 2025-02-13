import { NextFunction, Request, Response } from "express";

import userModel from "../models/user.model";


export const saveUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        // Check if all required fields are provided
        if (!username || !email || !password) {
            res.status(400).json({ message: "Missing required fields." });
            return;
        }

        // Create a new user instance with the hashed password
        const newUser = new userModel({
            username,
            email,
            password,
        });

        // Save the new user to the database
        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            success: true
        });
    } catch (error: any) {
        console.error(`Error in saveUser: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

export const uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;
    const imageUrl = `http://localhost:3000/uploads/${req.file?.filename}`;

    console.log('hi');


    try {
        const updatedUser = await userModel.findOneAndUpdate(
            { email },
            { profileImage: imageUrl },
            { new: true }
        );

        if (!updatedUser) {
            console.log('error')
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({ imageUrl });
    } catch (error: any) {
        console.error(`Error in uploadImage: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

export const getUsers = async (req: Request, res: Response): Promise<any> => {
    try {
        const users = await userModel.find({ role: 'user' });
        return res.status(200).json({ users });
    } catch (error: any) {
        console.error(`Error in getUsers: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

export const updateStatus = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Missing email.' });
    }

    try {
        const updatedUser = await userModel.findOneAndUpdate(
            { email },
            [{ $set: { isBlocked: { $not: '$isBlocked' } } }],
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({
            message: 'User Removed.',
            updatedUser
        });

    } catch (error: any) {
        console.error(`Error in getUsers: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

export const search = async (req: Request, res: Response): Promise<any> => {
    try {
        const email = req.query.email as string;
        const regex = new RegExp(`^${email}`, 'i');
        
        const users = await userModel.find({ email: regex, role: 'user' });

        res.status(200).json({ users });

    } catch (error: any) {
        console.error(`Error in search: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
}
