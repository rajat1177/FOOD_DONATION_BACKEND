import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../config/config.js';

export const authMiddleware = async(req,res,next) => {
    
    try{
        // console.log("helo");
        const {token} = req.cookies ;
        // const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        // console.log(token);
        // console.log(req.cookies);
        
        
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }
        jwt.verify(token, SECRET_KEY, (err,decoded)=>{
            if(err){
                res.status(403).json({message: "Forbidden: Invalid Token"})
            }
            
            req.user = decoded;
            // console.log(req.user.userId);
            
            next();
        })

    }
    catch(err){
        console.error(err);
        res.status(500).json({message: "Server error"})
    }
}

// export const authenticate = async (req, res, next) => {
//     try {
//         const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
//         if (!token) {
//             return res.status(401).json({ message: "Unauthorized: No token provided" });
//         }

//         const decoded = jwt.verify(token, SECRET_KEY);
//         req.user = await User.findById(decoded.id).select("-password");
//         if (!req.user) {
//             return res.status(401).json({ message: "Unauthorized: Invalid user" });
//         }

//         next();
//     } catch (err) {
//         console.error(err);
//         res.status(403).json({ message: "Forbidden: Invalid token" });
//     }
// };

// Admin Authorization
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied: Admins only" });
    }
}; 