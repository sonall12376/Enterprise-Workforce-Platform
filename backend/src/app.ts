import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import notFound from './middleware/notFound';
import errorHandler from './middleware/errorHandler';
import attendanceRouter from './routes/attendance/attendanceRouter';
import leaveRouter from './routes/leave/leaveRouter';
import payrollRouter from './routes/payroll/payrollRouter';
import performanceRouter from './routes/performance/performanceRouter';
import notificationRouter from './routes/notification/notificationRouter';
import projectRouter from './routes/projects/projectRoutes';
import assetRouter from './routes/assets/assetRoutes';
import helpDeskRouter from './routes/helpdesk/helpDeskRoutes';
import reportRouter from './routes/reports/reportRoutes';
import aiRouter from './routes/ai/aiRoutes';

import authRoutes from './routes/auth/authRoutes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Logging Middleware
app.use(morgan('dev'));

// Body Parser Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root API redirection to Health Check
app.get('/', (req, res) => {
  res.redirect('/api/health');
});

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Enterprise Workforce Management API is healthy',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leaves', leaveRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/projects', projectRouter);
app.use('/api/assets', assetRouter);
app.use('/api/helpdesk', helpDeskRouter);
app.use('/api/reports', reportRouter);
app.use('/api/ai', aiRouter);

// Fallback Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
