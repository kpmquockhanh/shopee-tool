import { Server } from 'socket.io';

export default async (expressServer, expressApp) => {
  console.log('Start load ws');
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
    if (!auth || !auth.cart) {
      socket.disconnect(true);
    }

    // socket.join(auth.cart);
    // io.to(auth.cart).emit('welcome_msg', { msg: 'hello from emit room' });
    // socket.emit('my_message', 'welcome');
    // io.emit('hello', 'world');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
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
    console.log('leave-room', room, id);
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
    if (!auth || !auth.key) {
      return next(new Error('unauthorized'));
    }

    if (!auth.name) {
      return next(new Error('invalid name'));
    }

    socket.username = auth.name;
    socket.res_id = auth.key;

    return next();
  });
};
