import { Router } from "express"

import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

import { CheckOutCase, ResolveCase, GetAllCases, GetAllUsers, VerifyUser, SuspendUser, GetCaseStatistics, GetUserStatistics, Search, GetCasesByUser, GetTopCommunities, GetTopWards, GetTopLGAs,GetCasesByLocation  } from "../controllers/admin.controller.js";

const router = Router()

router.route('/cases/:caseID/checkout').post(authMiddleware, adminMiddleware, CheckOutCase);
router.route('/cases/:caseID/resolve').post(authMiddleware, adminMiddleware, ResolveCase);
router.route('/cases').post(authMiddleware, adminMiddleware, GetAllCases);
router.route('/users').post(authMiddleware, adminMiddleware, GetAllUsers);
router.route('/users/:userID/verify').post(authMiddleware, adminMiddleware, VerifyUser);
router.route('/users/:userID/suspend').post(authMiddleware, adminMiddleware, SuspendUser);
router.route('/analytics/cases').post(authMiddleware, adminMiddleware, GetCaseStatistics);
router.route('/analytics/users').post(authMiddleware, adminMiddleware, GetUserStatistics);
router.route('/analytics/locations').post(authMiddleware, adminMiddleware, GetCasesByLocation);
router.route('/analytics/lgas').post(authMiddleware, adminMiddleware, GetTopLGAs);
router.route('/analytics/wards').post(authMiddleware, adminMiddleware, GetTopWards);
router.route('/analytics/communities').post(authMiddleware, adminMiddleware, GetTopCommunities);
router.route('/analytics/usercases').post(authMiddleware, adminMiddleware, GetCasesByUser);
router.route('/search').post(authMiddleware, adminMiddleware, Search);

export default router