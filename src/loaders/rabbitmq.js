import client from 'amqplib';

import {
  rabbitmqUser, rabbitmqPassword, rabbitmqHost,
} from '../config/index.js';
import handleNewImageUploaded from './rabbitmq-handlers/new-image-handler.js';
import handleNewError from './rabbitmq-handlers/error-handler.js';

class RabbitMQConnection {
  connection;

  channel;

  connected;

  async connect() {
    if (this.connected && this.channel) return;
    this.connected = true;

    try {
      console.log('⌛️ Connecting to Rabbit-MQ Server');
      this.connection = await client.connect(
        `amqp://${rabbitmqUser}:${rabbitmqPassword}@${rabbitmqHost}:5672`,
      );

      console.log('✅ Rabbit MQ Connection is ready');

      this.channel = await this.connection.createChannel();

      console.log('🛸 Created RabbitMQ Channel successfully');
    } catch (error) {
      console.error(error);
      console.error('Not connected to MQ Server');
    }
  }

  async sendToQueue(queue, message) {
    try {
      if (!this.channel) {
        await this.connect();
      }

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

const mqConnection = new RabbitMQConnection();

export default () => {
  mqConnection.connect().then(() => {
    mqConnection.consume('new-image', handleNewImageUploaded).then();
    mqConnection.consume('new-error', handleNewError).then();
  });
};
export const connection = mqConnection;
