import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token missing'
        });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'user not found'
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('JWT verification failed:', error);
        return res.status(401).json({
            success: false,
            message: 'token invalid OR expired'
        });
    }

}

