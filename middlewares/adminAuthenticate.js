import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { SECRET_KEY } from '../config/config.js';

export const authenticateAdmin = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        // console.log("token: ",token);
        
        if (!token) return res.status(403).json({ message: "Access denied. No token provided." });
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                res.status(403).json({ message: "Forbidden: Invalid Token" })
            }
            req.admin = decoded;
            next();
        })
    }
    catch (error) {
        res.status(400).json({ message: "Invalid or expired token." });
    }
};