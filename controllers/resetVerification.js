import User from "../models/user.js";
import { sendOtp } from "../utils/generateOtp.js";
import  {validationResult}  from "express-validator";

export const resetVerification = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await sendOtp(email);
        return res.status(200).json("Otp sent");
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error on Reset Password' });
    }
}