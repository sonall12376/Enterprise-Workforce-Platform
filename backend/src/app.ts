import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import notFound from './middleware/notFound';
import errorHandler from './middleware/errorHandler';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Logging Middleware
app.use(morgan('dev'));

// Body Parser Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Enterprise Workforce Management API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Register feature routers
import projectRouter from './routes/projects/projectRoutes';
app.use('/api/projects', projectRouter);

import assetRouter from './routes/assets/assetRoutes';
app.use('/api/assets', assetRouter);

import helpDeskRouter from './routes/helpdesk/helpDeskRoutes';
app.use('/api/helpdesk', helpDeskRouter);

import reportRouter from './routes/reports/reportRoutes';
app.use('/api/reports', reportRouter);

import aiRouter from './routes/ai/aiRoutes';
app.use('/api/ai', aiRouter);


// Fallback Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
