
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoute from './routes/auth.route.ts';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {SocketIo} from './lib/socket.ts';
import { publisher , subscriber } from './lib/redisClient.ts';

const app = express();

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use('/api/auth', authRoute);

async function startServer() {
  try {
    const PORT = process.env.PORT || 3000;
    await publisher.connect();
    await subscriber.connect();
    const socketIo = new SocketIo(io);
    await socketIo.init();
    
    server.listen(PORT, () => {
      console.log('Server is running on port', PORT);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();