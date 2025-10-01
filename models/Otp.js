import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: Number, required: true },
  emailVerified: {type: Boolean},
  expiry: { type: Date, required: true },
  name: { type: String, default: null},
  password: { type: String, default: null },
  role: {type: String, default: null},
});

const Otp = mongoose.model('Otp', otpSchema);
export default Otp