import Otp from "../models/Otp.js";
import User from "../models/user.js";
import bcrypt from 'bcrypt'
import  {validationResult}  from "express-validator";

export const resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ errors: errors.array() })
        }
        const { email } = req.query;
        const { enteredOtp, newPassword } = req.body;
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
        if (enteredOtp !== otpRecord.otp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }
        if (enteredOtp === otpRecord.otp) {
            const hashedPassword = await  bcrypt.hash(newPassword, 10)
            await Otp.deleteOne({ email });
            await User.updateOne({ email }, { $set: { password: hashedPassword } })
            return res.status(201).json("Password Chnaged");
        }
        await Otp.deleteOne({ email });
        res.status(408).json({message: "Requested Timeout"})
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" })
    }
}