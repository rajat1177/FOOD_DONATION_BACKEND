import express from "express";
import { getAllFoodListings,getFilteredFoodListings, getUserFoodListing , getSearchedFoodListings,getFoodListingById, createFoodListing, updateFoodListing, deleteFoodListing } from "../controllers/foodListingController.js";
import { authMiddleware } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/multer.js"; 
import { sendDonationSuccessEmail } from "../utils/SendDonationSuccessEmail.js";
import {body} from 'express-validator'

const router = express.Router();

router.get("/FoodListings", authMiddleware,getAllFoodListings);
router.get("/FoodSearched-Listings/:filter", authMiddleware,getSearchedFoodListings);
router.get("/FoodListings/:id",authMiddleware, getFoodListingById);
router.put("/FoodListings/:id",upload.single("photo"),authMiddleware,updateFoodListing);
router.get("/FoodListings/Filtered", authMiddleware,getFilteredFoodListings);
router.get("/user-FoodListings", authMiddleware,getUserFoodListing);
router.delete("/FoodListings/:id",authMiddleware, deleteFoodListing);






// Route to send donation success email
router.post('/send-donation-email', authMiddleware, async (req, res) => {
  try {
      const { email } = req.body; // Extract email from the body
      const { title, quantity, category, locationAddress } = req.body;

      // Validate required fields
      if (!email || !title || !quantity || !category || !locationAddress) {
          return res.status(400).json({ message: 'All fields are required to send the email.' });
      }

      // Call the function to send the email
      await sendDonationSuccessEmail(email, {
          title,
          quantity,
          category,
          locationAddress,
      });

      res.status(200).json({
          message: 'Donation success email sent successfully!',
      });
  } catch (error) {
      console.error('Error sending donation success email:', error);
      res.status(500).json({ message: 'Server error while sending email.' });
  }
});





router.post(
    "/Create-FoodListings",
    upload.single("photo"),
    authMiddleware,
    // upload.array("photos", 10), 
    // [
    //   body('title').notEmpty().withMessage('title is required'),
    //   body('description').notEmpty().withMessage('your food description'),
    //   body('category').notEmpty().withMessage('your food category'),
    //   body('quantity').notEmpty().withMessage('quantity is required').isNumeric().withMessage('quantity must be a number'),
    //   body('expirationDate').notEmpty().withMessage('expirationDate is required').isISO8601().withMessage('expirationDate must be a valid ISO8601 date'),
    //   body('location.address').notEmpty().withMessage('location address is required'),
    //   body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('location coordinates must be an array with two numbers [longitude, latitude]')
    //     .custom((value) => {
    //       if (!Array.isArray(value) || value.some(isNaN)) {
    //         throw new Error('location coordinates must contain only numbers');
    //       }
    //       return true;
    //     }),
    //   body('photos').optional(),
    //   body('postedBy').notEmpty().withMessage('postedBy is required').isMongoId().withMessage('postedBy must be a valid MongoDB ObjectId'),
    //   body('isModerated').optional().isBoolean().withMessage('isModerated must be a boolean'),
    // ],
    createFoodListing
  );
  

export default router;