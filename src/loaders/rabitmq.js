import client from 'amqplib';

import {
  rabbitmqUser, rabbitmqPassword, rabbitmqHost,
} from '../config/index.js';
import { Attachment } from '../models/index.js';

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

  async consume(queue, handleIncomingNotification) {
    await this.channel.assertQueue(queue, {
      durable: true,
    });

    this.channel.consume(
      queue,
      (msg) => {
        if (!msg) {
          return console.error('Invalid incoming message');
        }
        handleIncomingNotification(msg?.content?.toString());
        return this.channel.ack(msg);
      },
      {
        noAck: false,
      },
    );
  }
}

const handleNewImageUploaded = async (message) => {
  console.log('Message received', message);
  const msg = JSON.parse(message);
  const attachment = await Attachment.findById(msg.attachment_id);
  console.log(attachment);
};

const mqConnection = new RabbitMQConnection();

const initConnection = () => {
  mqConnection.connect().then(() => {
    mqConnection.consume('new-image', handleNewImageUploaded).then();
  });
};

export default initConnection;
export const connection = mqConnection;
