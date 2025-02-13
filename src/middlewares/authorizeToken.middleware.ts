import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";

export const authorizeToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies?.userToken;
        
        const isVerified = verifyAccessToken(JSON.parse(token));
        if (!isVerified) {
            res.status(401).json({ message: 'Unauthorized to access this route.' });
            return;
        }
        next();
    } catch (error: any) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}