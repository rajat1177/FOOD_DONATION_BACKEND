import mongoose from "mongoose";

// Admin schema
const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    // if in future more admins required
    role: {
        type: String,
        default: "admin",
    },
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
