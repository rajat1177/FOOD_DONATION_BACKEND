import express from "express"
import helmet from "helmet"
import cors from "cors";
import userRoutes from "./routes/userRoutes.js"
import foodListingRoutes from "./routes/foodListingRoutes.js"
import ratingRoutes from "./routes/ratingRoutes.js";
import cookieParser from "cookie-parser";
import donationRoute from './routes/donationRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { body } from "express-validator";
import { authenticateAdmin } from "./middlewares/adminAuthenticate.js";
import { loginAdmin } from "./controllers/loginAdmin.js";
const app = express();
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://food-donation.s3-website.eu-north-1.amazonaws.com" // production S3
];


// import auth from './routes/userRoutes';
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / server-to-server
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // allow cookies
};

// ✅ Apply CORS middleware
app.use(cors(corsOptions));


app.use(cookieParser())
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

// user routes
app.use("/api/listings", foodListingRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/user/donate",donationRoute);
app.use("/api/user", userRoutes);

// admin routes
app.post("/api/super/admin/login", [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],loginAdmin);

app.use("/api/super/admin", authenticateAdmin,adminRoutes);

// Adding error-handling middleware at the end of middleware stack
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
  });

export default app;

