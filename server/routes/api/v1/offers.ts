import { Router } from 'express';
import specialOffersRouter from '../../special-offers';
import treatmentPackagesRouter from '../../treatment-packages';

const offersRouter = Router();

// Mount special offers routes
offersRouter.use('/special-offers', specialOffersRouter);

// Mount treatment packages routes
offersRouter.use('/treatment-packages', treatmentPackagesRouter);

export default offersRouter;