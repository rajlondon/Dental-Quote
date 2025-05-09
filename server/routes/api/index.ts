import { Router } from 'express';
import v1Router from './v1';

const apiRouter = Router();

// Mount API version routers
apiRouter.use('/v1', v1Router);

export default apiRouter;