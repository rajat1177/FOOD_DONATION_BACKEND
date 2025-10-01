import mongoose from "mongoose";

const foodListingSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            required: true 
        },
        description: { 
            type: String, 
            required: true 
        },
        category: { 
            type: String, 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true 
        }, 
        expirationDate: { 
            type: Date, 
            required: true },
            
        location: {
            address: { 
                type: String, 
                required: true },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        photo: { type: String },

        postedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        isModerated: { 
            type: Boolean, 
            default: false 
        }, 
        isReported: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const FoodListing = mongoose.model("FoodListing", foodListingSchema);
export default FoodListing;
