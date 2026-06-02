const { Server } = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: "*", // allow all for dev
        methods: ["GET", "POST", "PUT", "DELETE"]
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      // Clients can join a room using their user ID to receive direct notifications
      socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined room ${userId}`);
      });
      
      // NGOs can join a general 'ngo_room' to get all new food alerts
      socket.on('join_ngo_room', () => {
        socket.join('ngo_room');
        console.log(`Socket ${socket.id} joined ngo_room`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
