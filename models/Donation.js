import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
    {
        foodListing: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "FoodListing", 
            required: true 
        },
        requestedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        acceptedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        },
        //donor

        status: {
            type: String,
            enum: ["requested", "accepted", "scheduled", "completed"],
            default: "requested",
        },

        scheduledPickup: { 
            type: Date 
        }, // pickup

        completionDate: { 
            type: Date,
            validate: {
                validator: function(value) {
                    return !this.scheduledPickup || value >= this.scheduledPickup;
                },
                message: "Completion date must be after the scheduled pickup date.",
            }
        }
        ,
    },
    { timestamps: true }
);

donationSchema.methods.markAsCompleted = function() {
    this.status = "completed";
    this.completionDate = new Date();
    return this.save();
};


const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
