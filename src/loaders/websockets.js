import { Server } from 'socket.io';
import { Cart } from '../models/index.js';

export default async (expressServer, expressApp) => {
  const io = new Server(expressServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      // allowedHeaders: ['my-custom-header'],
      credentials: true,
    },
  });

  expressApp.use((req, res, next) => {
    req.io = io;
    next();
  });

  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    const { auth } = socket.handshake;
    if (!auth?.cart) {
      socket.disconnect(true);
      return;
    }
    socket.username = auth.name;

    socket.join(auth.cart);
    // io.to(auth.cart).emit('welcome_msg', { msg: 'hello from emit room' });
    // socket.emit('my_message', 'welcome');
    // io.emit('hello', 'world');
  });

  io.on('disconnect', (socket) => {
    console.log('a user disconnected', socket.id);
  });

  const getAllClients = (room) => {
    const clients = io.sockets.adapter.rooms.get(room);
    const clientData = [];
    clients.forEach((clientId) => {
      // this is the socket of each client in the room.
      const clientSocket = io.sockets.sockets.get(clientId);
      clientData.push({
        id: clientSocket.id,
        name: clientSocket.username,
      });
    });
    return clientData;
  };

  io.of('/').adapter.on('join-room', (room, id) => {
    if (room === id) {
      return;
    }
    const currentClient = io.sockets.sockets.get(id);
    io.to(room).emit('new_room_user', {
      msg: `${currentClient.username} joined this group`,
      room,
      id,
      clients: getAllClients(room),
    });
  });

  io.of('/').adapter.on('leave-room', (room, id) => {
    if (room === id) {
      return;
    }
    const currentClient = io.sockets.sockets.get(id);
    io.to(room).emit('leave_room_user', {
      msg: `${currentClient.username} leave this group`,
      room,
      id,
      clients: getAllClients(room),
    });
  });

  io.use(async (socket, next) => {
    const { auth } = socket.handshake;
    if (!auth || !auth.cart || !auth.key) {
      return next(new Error('unauthorized'));
    }
    const cart = await Cart.findOne({
      _id: auth.cart,
      // authKey: auth.key,
    }).exec();

    if (!cart) {
      return next(new Error('unauthorized'));
    }

    if (!auth.name) {
      return next(new Error('invalid name'));
    }

    return next();
  });
};
