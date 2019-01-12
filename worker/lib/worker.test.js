const amqp = require('amqplib');
const { Worker } = require('./worker');

/**
 *
 *
 * @class TestWorker
 * @extends {Worker}
 */
class TestWorker extends Worker {
  /**
   * Async sleep
   *
   * @param {number} ms
   * @returns Promise
   * @memberof TestWorker
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Message handle function
   *
   * @param {Object} msg Message object from consume method
   * @param {Buffer} msg.content Message content
   * @memberof TestWorker
   */
  async handle(msg) {
    if (msg) {
      await this.sleep(500);
      await this.channel.cancel(this.consumerTag);
      await this.channel.ack(msg);

      // Show jest that we consumed a message
      this.consumed = true;
    }
  }
}

const URL = process.env.url || 'amqp://localhost';

const QUEUE_NAME = process.env.QUEUE_NAME || 'test';

describe('TestWorker', () => {
  let worker;

  // Add messages to queue before tests
  beforeAll(async () => {
    const conn = await amqp.connect(URL);
    const channel = await conn.createChannel();

    await channel.assertQueue(QUEUE_NAME);

    for (let i = 0; i < 50; i++) {
      await channel.sendToQueue(QUEUE_NAME, Buffer.from('test'));
    }

    await conn.close();
  });

  it('creates instance', async () => {
    await expect(() => {
      worker = new TestWorker(URL, QUEUE_NAME);
    }).not.toThrowError();
  });

  it('connects to server', async () => {
    await expect(worker.connect()).resolves.not.toThrowError();
    expect(worker.connected).toBe(true);
  });

  it('disconnects from server', async () => {
    await expect(worker.disconnect()).resolves.not.toThrowError();
    expect(worker.connected).toBe(false);
  });

  it('consumes messages', async () => {
    try {
      await worker.start();
      await worker.sleep(1000);
      await worker.disconnect();
    } catch (e) {}

    expect(worker.consumed).toBe(true);
  });
});
