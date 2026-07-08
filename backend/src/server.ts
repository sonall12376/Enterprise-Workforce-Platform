import http from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import app from './app';
import { env } from './config/env';
import { connectDatabase } from './database/db';
import { Employee } from './models/Employee';

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust to match frontend domain in production
    methods: ['GET', 'POST'],
  },
});

// Basic Socket connection handler placeholder
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Example namespace/room check-in or messaging handlers
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const seedDefaultUser = async (): Promise<void> => {
  try {
    const exists = await Employee.findOne({ email: 'employee@organization.com' });
    if (!exists) {
      console.log('🌱 Seeding default user...');
      const passwordHash = await bcrypt.hash('SecurePassword123', 10);
      await Employee.create({
        orgId: '603d2e1b12cf000000000001',
        employeeId: 'EMP-10243',
        email: 'employee@organization.com',
        passwordHash,
        role: 'Employee',
        status: 'Active',
        name: 'Jane Doe',
        firstName: 'Jane',
        lastName: 'Doe',
        gender: 'Female',
        dob: new Date('1995-02-15'),
        phone: '+919876543211',
        emergencyContact: {
          name: 'John Doe',
          relationship: 'Spouse',
          phone: '+919876543211',
        }
      });
      console.log('✅ Default test user seeded successfully!');
    } else {
      console.log('ℹ️ Default test user already exists.');
    }
  } catch (error) {
    console.error(`💥 Failed to seed default user: ${(error as Error).message}`);
  }
};

const startServer = async () => {
  // Establish database connection
  await connectDatabase();

  // Seed default active user
  await seedDefaultUser();

  const PORT = env.PORT;
  server.listen(PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`💥 Failed to start server: ${(error as Error).message}`);
  process.exit(1);
});

