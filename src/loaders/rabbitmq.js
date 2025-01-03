import client from 'amqplib';
import {
  rabbitmqHost, rabbitmqPassword, rabbitmqUser, debug,
} from '../config/index.js';
import handleNewImageUploaded from './rabbitmq-handlers/new-image-handler.js';
import handleNewError from './rabbitmq-handlers/error-handler.js';
import handleHealthCheck from './rabbitmq-handlers/health-check-handler.js';

class RabbitMQConnection {
  connection;

  channel;

  connected;

  async connect() {
    if (this.connected && this.channel) return;
    this.connected = true;

    try {
      const url = `amqp://${rabbitmqUser}:${rabbitmqPassword}@${rabbitmqHost}:5672`;
      if (debug) {
        console.log('⌛️ Connecting to Rabbit-MQ Server', url);
      } else {
        console.log('⌛️ Connecting to Rabbit-MQ Server');
      }
      this.connection = await client.connect(
        `amqp://${rabbitmqUser}:${rabbitmqPassword}@${rabbitmqHost}:5672`,
      );

      console.log('✅ Rabbit MQ Connection is ready');
      this.channel = await this.connection.createChannel();
      console.log('🛸 Created RabbitMQ Channel successfully');
    } catch (error) {
      console.error('❌ Not connected to MQ Server', error.message);
    }
  }

  async sendToQueue(queue, message) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      this.channel.assertQueue(queue, {
        durable: true,
      });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async consume(queue, handler) {
    await this.channel.assertQueue(queue, {
      durable: true,
    });

    this.channel.consume(
      queue,
      (msg) => {
        if (!msg) {
          return console.error('Invalid incoming message');
        }
        try {
          console.log('Message received', msg.content.toString());
          const content = JSON.parse(msg.content.toString());
          handler(content);
          this.channel.ack(msg);
          return null;
        } catch (e) {
          console.error(e);
        }
        return null;
      },
      {
        noAck: false,
      },
    );
  }
}

export default (conn) => {
  const mqConnection = new RabbitMQConnection();
  mqConnection.connect().then(() => {
    mqConnection.consume('new-image', handleNewImageUploaded).then(() => {
      console.log('Awaiting new image upload...');
    });
    mqConnection.consume('new-error', handleNewError).then(() => {
      console.log('Awaiting new error...');
    });
    mqConnection.consume('health-check', handleHealthCheck(conn)).then(() => {
      console.log('Awaiting health check...');
    });
  });
};

export const rabbitmqLoader = async (app) => {
  const mqConnection = new RabbitMQConnection();
  await mqConnection.connect();
  app.set('mqConnection', mqConnection);
  return mqConnection;
};
