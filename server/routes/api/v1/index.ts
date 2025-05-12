import { Router } from "express";
import quotes from "./quotes";
import promos from "./promos";
import offers from "./offers";

const router = Router();

router.use("/quotes", quotes);
router.use("/promos", promos);
router.use("/offers", offers);

export default router;