import jwt from 'jsonwebtoken';
import { HTTP_STATUS_UNAUTHORIZED, HTTP_STATUS_INTERNAL_SERVER_ERROR} from '../utilities/status.js';

export default function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(HTTP_STATUS_UNAUTHORIZED).json({
                success: false,
                status: HTTP_STATUS_UNAUTHORIZED,
                message: 'Access denied',
                error: 'No token provided or invalid format',
            });
        }

        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(HTTP_STATUS_UNAUTHORIZED).json({
                    success: false,
                    status: HTTP_STATUS_UNAUTHORIZED,
                    message: 'Invalid or expired token',
                    error: err.message,
                });
            }

            req.user = { id: decoded.id };
            next();
        });
    } catch (error) {
        return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            status: HTTP_STATUS_INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
            error: error.message,
        });
    }
}
