import initConnection from '../loaders/rabbitmq.js';
import mongooseLoader from '../loaders/mongoose.js';

mongooseLoader().then((conn) => {
  initConnection(conn);
});
