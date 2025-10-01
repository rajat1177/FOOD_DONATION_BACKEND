import express from 'express';
import { changeStatusAccepted, changeStatusScheduled,requestDonation,markDonationCompleted,getDonationDetails,getAllDetails} from "../controllers/donationController.js";
import { authMiddleware } from "../middlewares/authenticate.js";

const router = express.Router();

router.use(authMiddleware);
router.post('/donations',requestDonation);
// router.patch('/donations/:id' ,authMiddleware, changeStatus);
router.put("/donations/:id/complete",  markDonationCompleted);
router.get('/donations' , getAllDetails);
router.get("/donations/:id", getDonationDetails);
router.patch('/donations/:id' , changeStatusAccepted);
router.patch('/donations/:id/schedule', changeStatusScheduled);



export default router;