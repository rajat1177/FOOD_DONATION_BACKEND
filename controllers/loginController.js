import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken.js';
import User from '../models/user.js';
import { validationResult } from 'express-validator';

export const loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        // ✅ Check if user exists first
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ✅ Then check if suspended
        if (user.status === 'suspended') {
            return res.status(403).json({ message: 'Suspended account.' });
        }

        // ✅ Verify password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // ✅ Generate token and set cookie
        const token = generateToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // true if using HTTPS
            sameSite: 'lax',
            maxAge: 43200000
        });

        // ✅ Send response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
