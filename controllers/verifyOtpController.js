import Otp from "../models/Otp.js";
import User from "../models/user.js";
import bcrypt from 'bcrypt'
import { generateToken } from "../utils/generateToken.js";
import { validationResult } from "express-validator";
export const verifyOtpController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ errors: errors.array() })
        }
        const { email } = req.query
        const { enteredOtp } = req.body
        const otpRecord = await Otp.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP not found for this email' });
        }
        const otp = otpRecord.otp;
        const currentTIme = new Date();
        if (currentTIme > otpRecord.expiry) {
            await Otp.deleteOne({ email });
            return res.status(400).json({ message: 'Expired Otp' });
        }
        if (enteredOtp !== otp) {

            return res.status(400).json({ message: "Invalid OTP" })
        }
        // if (enteredOtp === otp) {
        // console.log(otpRecord.password);
        const hashedPassword = await bcrypt.hash(otpRecord.password, 10)
        const newUser = await new User({
            name: otpRecord.name,
            email: otpRecord.email,
            password: hashedPassword,
            role: otpRecord.role,
            emailVerified: true,
        })
        const token = generateToken(newUser._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // true if using HTTPS
            sameSite: 'Lax', // Use 'None' for cross-origin requests
            maxAge: 12 * 60 * 60 * 1000, // 12 hours
        })
        await newUser.save()
        await Otp.deleteOne({ email });
        res.status(201).json({ message: 'User registered successfully', token });
        // }
        // res.status(400).json({ message: "exceptional error" })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error in OTP" })

    }
}