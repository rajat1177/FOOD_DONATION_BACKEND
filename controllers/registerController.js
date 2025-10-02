// import bcrypt from 'bcrypt';
import User from '../models/user.js';
// import { generateToken } from '../utils/generateToken.js';
import { validationResult } from 'express-validator';
import { sendOtp } from '../utils/generateOtp.js';
export const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ errors: errors.array() });
        }

        const { name, email, password, role } = req.body;

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const send = await sendOtp(email, { name, password, role });
        return res.json({ message: "Otp sent" });
    } catch (error) {
        console.error("Registration Error:", error);  // full error log on server
        res.status(500).json({ 
            message: 'Server error during registration', 
            error: error.message   // sends the actual error message
        });
    }
};
