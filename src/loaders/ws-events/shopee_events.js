// eslint-disable-next-line import/prefer-default-export
export const initShopEvents = (io) => {
  io.on('connection', (socket) => {
    const { auth } = socket.handshake;
    console.log('on connecccc', auth);
    if (!auth || !auth.cart) {
      socket.disconnect(true);
    }

    socket.join(auth.cart);
    socket.on('disconnect', () => {
      //
    });
  });

  const getAllClients = (room) => {
    const clients = io.adapter.rooms.get(room);
    const clientData = [];
    clients.forEach((clientId) => {
      // this is the socket of each client in the room.
      const clientSocket = io.sockets.get(clientId);
      clientData.push({
        id: clientSocket.id,
        name: clientSocket.username,
      });
    });
    return clientData;
  };

  io.adapter.on('join-room', (room, id) => {
    if (room === id) {
      return;
    }

    const currentClient = io.sockets.get(id);
    io.to(room).emit('new_room_user', {
      msg: `${currentClient.username} joined this group`,
      room,
      id,
      clients: getAllClients(room),
    });
  });

  io.adapter.on('leave-room', (room, id) => {
    if (room === id) {
      return;
    }
    const currentClient = io.sockets.get(id);
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
  console.log('WS: Shopee events loaded');
};
