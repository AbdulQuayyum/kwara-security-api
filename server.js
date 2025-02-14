import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import 'dotenv/config'

import ConnectDB from "./configurations/connect.js";
import authRoutes from "./routes/auth.route.js"
import adminRoutes from "./routes/admin.route.js"
import userRoutes from "./routes/user.route.js"
import miscRoutes from "./routes/misc.route.js"

const app = express()
const port = process.env.PORT || 8999

ConnectDB();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => res.json('Hey There, Welcome to My Server!'));
app.use("/v1/admin", adminRoutes)
app.use("/v1/auth", authRoutes)
app.use("/v1/user", userRoutes)
app.use("/v1/misc", miscRoutes)
app.listen(port, () => console.log(`The Server is running on port!`))