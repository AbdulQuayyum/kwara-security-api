import { Router } from "express"

import { GetLgasAndWards, GetStates } from "../controllers/mics.controller.js";

const router = Router()

router.route('/lgas-and-wards').post(GetLgasAndWards);
router.route('/states').post(GetStates);

export default router
