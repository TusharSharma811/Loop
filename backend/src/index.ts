import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoute from './routes/auth.route.ts';
import chatrouter from './routes/chat.route.ts';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {SocketIo} from './lib/socket.ts';
import { publisher , subscriber } from './lib/redisClient.ts';
import messageRouter from './routes/message.route.ts';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
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
    credentials: true,
  },
});



app.use('/api/auth', authRoute);
app.use("/api/u",chatrouter)
app.use("/api/u",messageRouter)
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