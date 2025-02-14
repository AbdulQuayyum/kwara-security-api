import { Router } from "express"

import authMiddleware from "../middlewares/auth.middleware.js";

import { GetUserProfile, UpdateUserProfile, ReportCase, GetUserCases, UpdateCase, GetCaseDetails } from "../controllers/user.controller.js";

const router = Router()

router.route('/get-user-profile').post(authMiddleware, GetUserProfile);
router.route('/update-user-profile').post(authMiddleware, UpdateUserProfile);
router.route('/report-case').post(authMiddleware, ReportCase);
router.route('/user-cases/:userID').post(authMiddleware, GetUserCases);
router.route('/cases/:caseID/details').post(authMiddleware, GetCaseDetails);
router.route('/cases/:caseID/update').post(authMiddleware, UpdateCase);

export default router