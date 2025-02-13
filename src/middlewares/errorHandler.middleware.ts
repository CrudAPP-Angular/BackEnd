import { Request, Response, NextFunction } from 'express';

export const errorHandle = (err: any, req: Request, res: Response) => {
    console.log('Error: ', err);
    
    res.status(500).json({
        message: 'An error occurred and caught in the error handling middleware.',
        error: err.message
    });
}