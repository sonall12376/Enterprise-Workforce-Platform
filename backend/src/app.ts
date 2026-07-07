import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import notFound from './middleware/notFound';
import errorHandler from './middleware/errorHandler';
import attendanceRouter from './routes/attendance/attendanceRouter';
import leaveRouter from './routes/leave/leaveRouter';

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
app.use('/api/attendance', attendanceRouter);
app.use('/api/leaves', leaveRouter);

// Fallback Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
