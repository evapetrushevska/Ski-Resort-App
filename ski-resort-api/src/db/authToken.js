import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token){
        res.status(401).json({ success: false, message: "No token provided. Please log in."});
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err){ 
            res.status(403).json({ success: false, message: "Invalid or expired token. Please log in again."});
            return;
        }
        
        req.user = decoded;
        next();
        });
};

export default authToken;