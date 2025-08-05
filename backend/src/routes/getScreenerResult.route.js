import { Router } from "express";
import { generateAccessToken, getMarketQuote, getStockList, loadIntradayData, loadOHLCData, upstoxLogin } from "../controllers/stockData.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { getScreenerResults } from "../controllers/getScreenerResult.controller.js";

const router = Router()

router.route("/screener-results").get(getScreenerResults);

export default router;