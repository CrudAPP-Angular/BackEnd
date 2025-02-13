import { Request, Response, NextFunction } from 'express';
import userModel from '../models/user.model';

const checkUserExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({
            message: 'An error occurred when checking if user exists. Email not found.',
        });
        return;
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists.' });
            return;
        }
        next();
    } catch (err) {
        next(err);
    }
};

export default checkUserExists;