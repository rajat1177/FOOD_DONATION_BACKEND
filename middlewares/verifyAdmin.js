import Admin from "../models/Admin.js";
export const verifyAdmin = async(req, res, next) => {
    const adminId = req.admin.userId
    // console.log("verifyAdmin: ",adminId);
    const admin = await Admin.findById(adminId);
    if (admin && admin.role === 'admin') {
        console.log("Admin Verified");
        next();
    } else {
        console.log(req.admin);
        
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};