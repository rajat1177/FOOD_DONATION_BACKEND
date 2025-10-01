import express from 'express';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
// import { validationResult } from 'express-validator';
import User from '../models/user.js';  // Assuming you have a User model
import Listing from '../models/FoodListing.js';  // Assuming you have a Listing model
import Report from '../models/Report.js';  // Assuming you have a Report model
// import { generateToken } from '../utils/generateToken.js';
import Admin from '../models/Admin.js';

const router = express.Router();

// Manage Users

// List all users
router.get('/manage-users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({users});
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// Deactivate/Activate User
router.patch('/manage-users/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'suspended'
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.status = status;  // Update status field
        await user.save();
        res.status(200).json({ message: 'User status updated', status: status });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
});

// Delete User
router.delete('/manage-users/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
});

// Moderate Listings
// All Unmoderated Listings
router.get('/moderate-listings', verifyAdmin, async (req, res) => {
    try {
        const listings = await Listing.find({ isModerated: false });
        res.status(200).json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching listings', error });
    }
});
router.patch('/moderate-listings-approve/:id',verifyAdmin, async(req,res)=>{
    try{
        const id = req.params.id;
        const listing = await Listing.findByIdAndUpdate(id, {isModerated: true} , { new: true });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        res.status(200).json({ message: "Listing approved", listing });
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
})

// delete Listing
router.delete('/moderate-listings/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findByIdAndDelete(id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        res.status(200).json({ message: 'Listing deleted successfully' });
    } 
    catch (error) {
        console.log(error);
        
        res.status(500).json({ message: 'Error deleting listing', error });
    }
})

// App Statistics

// Get total number of users, listings, and reports
router.get('/statistics', verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalListings = await Listing.countDocuments();
        const totalReports = await Report.countDocuments();

        res.status(200).json({
            totalUsers,
            totalListings,
            totalReports
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statistics', error });
    }
});

// Handle Reported Content/Users
// List all reported content
router.get('/handle-reports', verifyAdmin, async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('reportedBy')  //  user who reported
            .populate('reportedUser')  // user who got reported
            .populate('reportedContent');  // listing that was reported
        res.status(200).json(reports);
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: 'Error fetching reports', error });
    }
});

// Resolve Report (Accept/Reject)
router.patch('/handle-reports/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { resolution } = req.body;
    try {
        const report = await Report.findById(id);
        if (!report) return res.status(404).json({ message: 'Report not found' });

        // Update report status
        report.status = resolution;
        await report.save();

        if (resolution === 'accepted') {
            if (report.targetType === 'user') {
                const user = await User.findById(report.target);
                if (user) {
                    user.status = 'suspended';
                    await user.save();
                }
            } else if (report.targetType === 'content') {
                const listing = await Listing.findById(report.target);
                if (listing) {
                    await Listing.findByIdAndDelete(report.target); 
                }
            }
        }
        res.status(200).json({ message: 'Report handled successfully' });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: 'Error handling report', error });
    }
});


// logout
router.post('/logout',verifyAdmin, (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        path: '/'
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

export default router;