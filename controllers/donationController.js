import express from "express";
import Donate from '../models/Donation.js';

export const changeStatusAccepted = async (req, res) => {
    try {
        const userId = req.user.userId; 

        
        if (!req.params.id) {
            return res.status(400).json({ msg: "Donation ID is required" });
        }

        
        const donation = await Donate.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ msg: "Donation not found" });
        }

        if (donation.status === "accepted" ||donation.status === "scheduled") {
            return res.status(400).json({ msg: "Donation has already been accepted" });
        }

       
        donation.status = "accepted";
        donation.acceptedBy = userId;
        const updatedDonation = await donation.save();

        res.status(200).json({
            msg: "Donation status updated successfully",
            donation: updatedDonation,
        });
    } catch (err) {
        console.error("Error updating donation status:", err);
        res.status(500).json({
            msg: "Internal Server Error",
            error: err.message,
        });
    }
};

export const requestDonation = async(req,res)=>{
    try{
        const {foodListing}= req.body;
        const requestedBy = req.user.userId;

        
        if(!foodListing||!requestedBy){
            return res.status(400).json({error:'foodListing and requestedBy are required'});
        }

        const donation=new Donate({
            foodListing,requestedBy
        });
        await donation.save();

        res.status(201).json({
            message:"Donation request successful",
            donation,
        });
    }
    catch(error){
        console.error("Donation error occured",error);
        res.status(500).json({error:"Internal Server Error"})
    }
};

export const markDonationCompleted = async (req, res) => {
    // console.log("hello");
    
    try {
        const { id } = req.params;
        

        const donation = await Donate.findByIdAndUpdate(
            id, 
            { status: "completed", completionDate: new Date() }, 
            { new: true }
        );

        if (!donation) {
            return res.status(404).json({ error: "Donation not found." });
        }


        res.status(200).json({ message: "Donation marked as completed.", donation });
    } catch (error) {
        console.error("Error in markDonationCompleted:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getDonationDetails = async (req, res) => {
    try {
        
        const id = req.user.userId;
        // console.log(id);
        
        const foodId = req.params.id;
        const donation = await Donate.find({ foodListing:foodId,requestedBy:id})
            .populate("foodListing")
            .populate("requestedBy") 
            .populate("acceptedBy"); 

        if (!donation || donation.length === 0) {
            return res.status(404).json({ error: "No donations found for this user." });
        }

        res.status(200).json({ donation });
    } catch (error) {
        console.error("Error in getDonationDetails:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const changeStatusScheduled = async(req,res)=>{
    try {
        const {scheduledPickup } = req.body;
        if (!req.params.id) {
            return res.status(400).json({ msg: "Donation ID is required" });
        }

        
        const donation = await Donate.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ msg: "Donation not found" });
        }

        if (donation.status === "scheduled" || donation.status === "completed"  ) {
            return res.status(400).json({ msg: "Donation Finished" });
        }

       
        donation.status = "scheduled";
        donation.scheduledPickup = new Date(scheduledPickup);

        if (isNaN(donation.scheduledPickup) || isNaN(donation.completionDate)) {
            return res.status(400).json({ msg: "Invalid date format" });
        }
        const updatedDonation = await donation.save();

        res.status(200).json({
            msg: "Donation status updated successfully",
            donation: updatedDonation,
        });
    } catch (err) {
        console.error("Error updating donation status:", err);
        res.status(500).json({
            msg: "Internal Server Error",
            error: err.message,
        });
    }
};

export const getAllDetails = async (req, res) => {
    try {
        
        const id = req.user.userId;
        // Find donations where the user is either the requester, the accepter, or the creator
        const donation = await Donate.find({
            $or: [
                { user: id },
                { requestedBy: id },
                { acceptedBy: id }
            ]
        })
            .populate("foodListing")
            .populate("requestedBy")
            .populate("acceptedBy");
        
        // console.log(donation);
        
        if (!donation || donation.length === 0) {
            return res.status(201).json({ error: "No donations found for this user." });
        }

        res.status(200).json({ donation });
    } catch (error) {
        console.error("Error in getDonationDetails:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
