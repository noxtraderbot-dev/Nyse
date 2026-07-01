import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import depositsRouter from "./deposits";
import investmentsRouter from "./investments";
import withdrawalsRouter from "./withdrawals";
import portfolioRouter from "./portfolio";
import marketRouter from "./market";
import notificationsRouter from "./notifications";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(depositsRouter);
router.use(investmentsRouter);
router.use(withdrawalsRouter);
router.use(portfolioRouter);
router.use(marketRouter);
router.use(notificationsRouter);
router.use(settingsRouter);

export default router;
