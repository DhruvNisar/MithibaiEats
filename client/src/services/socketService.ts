import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token?: string): Socket => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO connected:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });
  }
  return socket;
};

export const joinUserRoom = (userId: string) => {
  if (socket && userId) {
    socket.emit('join:user', userId);
  }
};

export const joinCanteenRoom = (canteenId: string) => {
  if (socket && canteenId) {
    socket.emit('join:canteen', canteenId);
  }
};

export const joinOrderRoom = (orderId: string) => {
  if (socket && orderId) {
    socket.emit('join:order', orderId);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

