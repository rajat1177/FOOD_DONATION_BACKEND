import { validationResult } from "express-validator";
import Admin from "../models/Admin.js";
import bcrypt from 'bcrypt'
import { generateToken } from "../utils/generateToken.js";
export const loginAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });

        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = generateToken(admin._id)
        console.log(token);
        
        res.cookie('token', token, {
            httpOnly: true,
            sameSite:"lax",
            secure: false,
            maxAge: 43200000
        })
        res.status(200).json({
            message: "Login successful",
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}