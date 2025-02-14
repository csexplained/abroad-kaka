import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
} from "../controllers/admin-User.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyAdminjwt } from "../middlewares/adminAuth.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";


const router = Router();
router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,

        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyAdminjwt, logoutUser);
router.route("/refreashtoken").post(refreshAccessToken);
router.route("/change-password").post(verifyAdminjwt, changeCurrentPassword);
router.route("/current-user").post(verifyAdminjwt, getCurrentUser);
router.route("/update-account").patch(verifyAdminjwt, updateAccountDetails);

export default router