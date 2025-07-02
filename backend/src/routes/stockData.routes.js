import { Router } from "express";
import { generateAccessToken, getMarketQuote, loadOHLCData, upstoxLogin } from "../controllers/stockData.controller.js";

const router = Router()

router.route("/login").get(upstoxLogin)
router.route("/login/generate-token").get(generateAccessToken)
router.route("/candle-data").get(loadOHLCData)
router.route("/market-quote").get(getMarketQuote)

export default router