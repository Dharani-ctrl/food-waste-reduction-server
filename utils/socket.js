const { Server } = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: [
          "http://localhost:3000",
          "https://food-waste-reduction-client.vercel.app"
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined room ${userId}`);
      });

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