import 'reflect-metadata';
import express from 'express';
import authRouter from './routes/auth';
import tenantRouter from './routes/tenant';
import userRouter from './routes/user';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Config } from './config';
import { globalErrorHandler } from './middlewares/globalErrorHandler';

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

// Global Error Handler
app.use(globalErrorHandler);

export default app;
