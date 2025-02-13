import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import 'dotenv/config'

import ConnectDB from "./configurations/connect.js";


const app = express()
const port = process.env.PORT || 8080

ConnectDB();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => res.json('Hey There, Welcome to My Server!'));