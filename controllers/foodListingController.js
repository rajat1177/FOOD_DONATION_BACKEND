import APIFeatures from "../utils/APIFeatures.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import FoodListing from "../models/FoodListing.js";
import User from '../models/user.js'
import { validationResult } from 'express-validator';
import multer from "multer";

export const createFoodListing = async (req, res) => {
    try {
        // Validate the incoming request
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ errors: errors.array() });
        // }

        // Destructure fields from the request body
        const {
            title,
            description,
            category,
            quantity,
            expirationDate,
            locationAddress,
            longitude,   // Ensure these are included in req.body
            latitude,
        } = req.body;

        const userId = req.user.userId;
        const postedBy = userId;
        const photo = req.file;

        // Parse and validate location
        const location = {
            address: locationAddress,
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
        console.log(location);

        if (
            isNaN(location.coordinates[0]) ||
            isNaN(location.coordinates[1]) ||
            location.coordinates[0] === "" ||
            location.coordinates[1] === "" ||
            location.coordinates.length !== 2
        ) {
            return res.status(400).json({ error: "Invalid coordinates provided." });
        }

        // Upload the photo to Cloudinary (or any other service)
        let uploadedPhoto = null;
        if (photo) {
            const uploadedImage = await uploadOnCloudinary(photo.path); // Adjust function for your service
            if (uploadedImage) {
                uploadedPhoto = uploadedImage.url; // Save the uploaded photo URL
            }
        }

        // Parse and validate quantity and expiration date
        const parsedQuantity = parseInt(quantity, 10);
        const parsedExpirationDate = (() => {
            const parsedDate = new Date(expirationDate); // Parse the date
          
            if (isNaN(parsedDate.getTime())) {  // Check if date is valid
              throw new Error("Invalid date format. Please use a valid date.");
            }
          
            return parsedDate; // Return valid date
          })();

        if (isNaN(parsedQuantity) || parsedExpirationDate.toString() === "Invalid Date") {
            return res.status(400).json({ error: "Invalid quantity or expiration date." });
        }

        // Create a new food listing
        const newListing = new FoodListing({
            title,
            description,
            category,
            quantity: parsedQuantity,
            expirationDate: parsedExpirationDate,
            location,
            photo: uploadedPhoto,
            postedBy,
        });

        await newListing.save();

        // Update the user's food items
        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        user.foodItems.push(newListing._id);
        await user.save();

        // Respond with success
        res.status(201).json({
            message: "Food listing created successfully!",
            listing: newListing,
        });
    } catch (error) {
        console.error("Error in createFoodListing:", error);
        res.status(500).json({ error: "Internal Server Error. Please try again later." });
    }
};


export const updateFoodListing = async (req, res) => {
    try {
        const userId = req.user.userId;
        const listingId = req.params.id;
        const updateData = req.body; 
        const photo = req.file;

        console.log("Request Body:", updateData);
        console.log("Request File:", photo);

        if (photo) {
            // Upload photo to Cloudinary
            const uploadedImage = await uploadOnCloudinary(photo.path);
            if (uploadedImage) {
                updateData.photo = uploadedImage.url; // Assign Cloudinary URL
            }
        }

        // Update the food listing
        const updatedListing = await FoodListing.findByIdAndUpdate(listingId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedListing) {
            return res.status(404).json({ error: "Food listing not found." });
        }

        // Ensure the logged-in user is authorized
        if (updatedListing.postedBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You are not authorized to update this listing." });
        }

        res.status(200).json({
            message: "Food listing updated successfully!",
            listing: updatedListing,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Failed to update the listing. Please try again later." });
    }
};



export const deleteFoodListing = async (req, res) => {
    try {
        const userId = req.user.userId; // Logged-in user's ID
        const listingId = req.params.id; // ID of the food listing to delete
        
        const deletedListing = await FoodListing.findById(listingId);
        
        if (!deletedListing) {
            return res.status(404).json({ error: "Food listing not found." });
        }
        
        console.log("check: ", deletedListing.postedBy.toString());
        console.log("userId: ", userId);

        // Ensure the logged-in user is the one who posted the listing
        if (deletedListing.postedBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You are not authorized to delete this listing." });
        }

        // Delete the listing
        await FoodListing.findByIdAndDelete(listingId);

        // Update the user's foodItems array
        const user = await User.findById(userId);
        user.foodItems = user.foodItems.filter(item => item.toString() !== listingId);
        await user.save();

        res.status(200).json({ message: "Food listing deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error deleting food listing. Please try again later." });
    }
};


export const getAllFoodListings = async (req, res) => {
    try {
        const user = req.user.userId;
        const allFoodItems = await FoodListing.find();
        if (!allFoodItems) {
            return res.status(404).json({
                status: 'fail',
                message: 'Food item not found',
            });
        }
        // console.log(user);
        // console.log(allFoodItems);

        // console.log(allFoodItems);

        res.status(200).json({
            allFoodItems
        });
    } catch (err) {
        // Handle any errors
        console.log(err);
        res.status(400).json({
            status: 'error',
            message: 'Error fetching food item',
        });
    }
}
export const getSearchedFoodListings = async (req, res) => {
    const filter = req.params.filter || "";

    try {
        // Wait for the query result
        const lists = await FoodListing.find({
            $or: [{
                category: {
                    $regex: filter,
                    $options: 'i' // Making case-insensitive
                }
            }]
        });

        // If no listings found, return this
        if (!lists || lists.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No listings found"
            });
        }

        return res.json({
            list: lists.map(list => ({
                _id: list.id,
                title: list.title,
                description: list.description,
                category: list.category,
                quantity: list.quantity,
                expirationDate: list.expirationDate,
                location: list.location,
                photo: list.photo,
                postedBy: list.postedBy,
                isModerated: list.isModerated
            }))
        });

    } catch (error) {
        console.error("Error fetching listings:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


export const getFilteredFoodListings = async (req, res) => {
    try {
        const features = new APIFeatures(FoodListing.find(), req.query)
            .filter()
            .sort()
            .fieldLimiting();

        const newFood = await features.query;

        res.status(200).json({
            length: newFood.length,
            newFood
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            status: 'error coming',
            message: err,
        });
    }
};

export const getFoodListingById = async (req, res) => {
    try {
        const foodId = req.params.id;
        const foodItem = await FoodListing.findById(foodId);
        const user = await User.findById(foodItem.postedBy)
        
        if (!foodItem) {
            return res.status(404).json({
                status: 'fail',
                message: 'Food item not found',
            });
        }
        res.status(200).json({ user,foodItem });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            status: 'error',
            message: 'Error fetching food item',
        });
    }
}
export const getUserFoodListing = async (req,res) => {
    try {
        const userId = req.user.userId;
        if(!userId){
            return res.status(404).json({message: "User Not Found"})
        }
        const listings = await FoodListing.find({ postedBy: userId });
        if (listings.length === 0) {
            return res.status(200).json({ message: "No Donations made yet!", listings: [] });
        }
        return res.status(200).json({ listings });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Server Error"})
        
    }
}
