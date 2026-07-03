import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { connectDatabase } from './database/db';

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

const startServer = async () => {
  // Establish database connection
  await connectDatabase();

  const PORT = env.PORT;
  server.listen(PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`💥 Failed to start server: ${(error as Error).message}`);
  process.exit(1);
});
