import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Otp from '../models/Otp.js';

dotenv.config();

export const sendOtp = async (email, additionalData = {}) => {
    try {
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const newOtpData = {
            email,
            otp,
            expiry: expiryTime,
            ...additionalData,
        };
        await Otp.updateOne(
            { email }, // Find by email
            { $set: newOtpData }, // Update the OTP details
            { upsert: true } // Insert if no record exists
        ).catch(err => {
            console.error('Error while updating OTP in database:', err);
            throw new Error('Failed to update OTP in database');
          });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        console.log('OTP sent to email:', email);

        return otp;
    } catch (err) {
        console.error('Error sending OTP:', err);
        throw new Error('Failed to send OTP');
    }
};
