import bcrypt from 'bcrypt'
import { generateToken } from '../utils/generateToken.js'
import User from '../models/user.js'
import { validationResult } from 'express-validator';
export const loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        // console.log(email);
        // console.log(password);

        const user = await User.findOne({ email })
        if(user.status==='suspended') {
            return res.status(401).json({ message: 'suspended account.' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user._id);
        // console.log(token);
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,  // Set to true if using HTTPS
            sameSite: 'lax',  // If cross-origin request
            maxAge: 43200000
        })
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
}