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

// import auth from './routes/userRoutes';
const app = express();
app.use(cors({
  origin: "*"
}));


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

