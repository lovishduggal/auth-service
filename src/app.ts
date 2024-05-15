import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';
import authRouter from './routes/auth';
import tenantRouter from './routes/tenant';
import userRouter from './routes/user';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Config } from './config';

const app = express();
app.use(
    cors({
        origin: [Config.FRONTEND_URI!],
        credentials: true,
    }),
);
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantRouter);
app.use('/api/users', userRouter);

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
