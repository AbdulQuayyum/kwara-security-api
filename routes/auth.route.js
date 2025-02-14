import { Router } from "express"

import authMiddleware from "../middlewares/auth.middleware.js";
import { LoginAccount, CreateAccount, ChangePassword, ForgotPassword, ResetPassword } from "../controllers/auth.controller.js";

const router = Router()

router.route('/create-account').post(CreateAccount);
router.route('/signin').post(LoginAccount);
router.route('/change-password').post(authMiddleware, ChangePassword);
router.route('/forgot-password').post(ForgotPassword);
router.route('/reset-password').post(ResetPassword);

export default router
