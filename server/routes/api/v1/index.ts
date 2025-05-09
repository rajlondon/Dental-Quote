import { Router } from "express";
import quotes from "./quotes";
import promos from "./promos";

const router = Router();

router.use("/quotes", quotes);
router.use("/promos", promos);

export default router;