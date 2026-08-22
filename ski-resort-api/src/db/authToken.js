import jwt from 'jsonwebtoken';

const authToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token){
        res.status(401).json({ success: false, message: "No token provided. Please log in."});
        return;
    }

    jwt.verify(token, process.evn.JWT_SECRET, (err, decoded) => {
        if (err){ 
            res.status(403).json({ success: false, message: "Invalid or expired token. Please log in again."});
            return;
        }
        
        req.user = decoded;
        next();
        });
};

export default authToken;