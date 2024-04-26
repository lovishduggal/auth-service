import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';
import authRouter from './routes/auth';
import tenantRouter from './routes/tenant';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/auth', authRouter);
app.use('/tenants', tenantRouter);

app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: HttpError, req: Request, res: Response, next: NextFunction) => {
        logger.error(err.message);
        const statusCode = err.statusCode || err.status || 500;
        res.status(statusCode).json({
            errors: [
                {
                    type: err.name,
                    msg: err.message,
                    path: '',
                    location: '',
                },
            ],
        });
    },
);

export default app;
