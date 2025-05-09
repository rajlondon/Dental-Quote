import { Router } from 'express';
import quotesRouter from './quotes';

const v1Router = Router();

// Mount all v1 route groups
v1Router.use('/quotes', quotesRouter);

export default v1Router;