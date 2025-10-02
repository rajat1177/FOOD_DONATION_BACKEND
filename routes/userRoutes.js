import express from 'express';
import { body, check, validationResult } from 'express-validator';
import User from "../models/user.js";
import { isAdmin, authMiddleware } from "../middlewares/authenticate.js";
import { registerUser } from '../controllers/registerController.js'
import { loginUser } from '../controllers/loginController.js'
import { verifyOtpController } from '../controllers/verifyOtpController.js';
import { updatePassword } from '../controllers/updatePassController.js';
import { resetVerification } from '../controllers/resetVerification.js';
import { resetPassword } from '../controllers/resetPassword.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.js"; 
const router = express.Router();

router.post("/register", [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['individual', 'business', 'charity']).withMessage('Invalid role'),
], registerUser);

router.post("/verify-otp", [
    body('enteredOtp').notEmpty().withMessage('OTP is required')
], verifyOtpController);

router.post("/login", [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], loginUser);

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        path: '/'
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

router.post("/reset-verification",[
    body('email').isEmail().withMessage('Please include a valid email')
], resetVerification)
router.put("/reset-password",[
    body('enteredOtp').notEmpty().withMessage('OTP is required'),
    check('newPassword', 'New password must be at least 6 characters long').isLength({ min: 6 })
],resetPassword);

router.put("/update-password",[
    check('oldPassword', 'Old password is required').notEmpty(),
    check('newPassword', 'New password must be at least 6 characters long').isLength({ min: 6 })
], authMiddleware, updatePassword );


router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const userId =req.user.userId;
        // console.log(userId);
        
        const user = await User.findById(userId);
        // console.log(user);
        
        if (!user) return res.status(404).json({ message: "User not found" });
        // console.log(user);
        
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


router.put("/profile", upload.single("profilePicture"), authMiddleware, async (req, res) => {
    try {
        // Remove the password field from the body if it exists (not updating password here)
        const { password, ...updateData } = req.body;

        // Get the uploaded photo (file)
        const photo = req.file;
        console.log(photo.path); // Logs the path of the uploaded file (in the temporary folder)

        // If there's a photo, upload it to Cloudinary
        if (photo.path) {
            const uploadedImage = await uploadOnCloudinary(photo.path); // Assuming you have this function
            if (uploadedImage) {
                updateData.profilePicture = uploadedImage.url; // Store the URL of the uploaded image
            }
        }

        console.log(updateData); // Log the data being sent to MongoDB for updating

        // Update the user in the database
        const updatedUser = await User.findByIdAndUpdate(req.user.userId, updateData, {
            new: true, 
            runValidators: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Respond with the updated user data
        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});




//delete

router.delete("/profile", authMiddleware, async (req, res) => {
    try {
        if (req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});



// router.get("/users", authenticate,isAdmin, async (req, res) => {
//     try {
//         const users = await User.find();
//         res.json(users);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

router.post("/profile/:id/reviews", authMiddleware, async (req, res) => {
    try {
        const { comment, rating } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const review = {
            reviewer: req.user.id,
            comment,
            rating,
        };

        user.reviews.push(review);

        user.rating = (
            user.reviews.reduce((sum, r) => sum + r.rating, 0) / user.reviews.length
        ).toFixed(1);

        await user.save();
        res.status(201).json({ message: "Review added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/profile/:id/reviews", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("reviews.reviewer", "name");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Server error" });
    }
});


export default router;
