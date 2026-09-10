import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config/env';

let io: Server | null = null;

export const initSocketServer = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000', '*'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Client connected to Socket.IO: ${socket.id}`);

    // Join student/user room
    socket.on('join:user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        socket.join(`student:${userId}`);
        console.log(`Socket ${socket.id} joined user room: user:${userId}`);
      }
    });

    // Join canteen room (staff or interested student)
    socket.on('join:canteen', (canteenId: string) => {
      if (canteenId) {
        socket.join(`canteen:${canteenId}`);
        console.log(`Socket ${socket.id} joined canteen room: canteen:${canteenId}`);
      }
    });

    // Join specific order room (for live order tracking)
    socket.on('join:order', (orderId: string) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        console.log(`Socket ${socket.id} joined order room: order:${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected from Socket.IO: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketServer = (): Server | null => {
  return io;
};
