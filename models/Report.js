import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        reportedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        reportedUser: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        },
        reportedContent: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "FoodListing" 
        },
        reason: { 
            type: String, 
            required: true 
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "resolved"],
            default: "pending",
        },
        resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    },
    { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
