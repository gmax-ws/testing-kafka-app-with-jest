/** @module KafkaAvroConsumer */

import KafkaAvro from 'kafka-avro';
import { inboundTopic, inboundKafkaBroker, inboundSchemaRegistry } from './config';

/**
 * Create a Kafka Avro Consumer to get messages from the inbound Kafka queue with
 */
class KafkaAvroConsumer {
  constructor() {
    return (async () => {
      this.client = KafkaAvroConsumer.getKafkaClient();
      await KafkaAvroConsumer.initialiseKafkaClient(this.client);
      this.consumer = await KafkaAvroConsumer.getKafkaConsumer(this.client);
      await KafkaAvroConsumer.connectKafkaConsumer(this.consumer);
      return this;
    })();
  }

  /**
   * @static getKafkaClient - Use kafka-avro to create a Avro Kafka client
   *
   * @return {KafkaAvro} unitialised Avro Kafka client
   */
  static getKafkaClient() {
    return new KafkaAvro({
      kafkaBroker: inboundKafkaBroker,
      schemaRegistry: inboundSchemaRegistry,
      topics: [inboundTopic],
      fetchAllVersions: true,
      wrapUnions: false
    });
  }

  /**
   * @static async - Initialise the provided KafkaAvro client
   *
   * @param  {KafkaAvro} client KafkaAvro instance
   * @return {void}
   */
  static async initialiseKafkaClient(client) {
    if (typeof (client) === 'undefined') {
      throw new Error('Client not defined');
    }
    await client.init();
  }

  /**
   * @static async - get a Consumer for the provided KafkaAvro client
   *
   * @param  {KafkaAvro} client Initialised KafkaAvro client
   * @return {Consumer} Consumer to get messages with
   */
  static async getKafkaConsumer(client) {
    if (typeof (client) === 'undefined') {
      throw new Error('Client not defined');
    }
    return client.getConsumer({
      'group.id': `${inboundTopic}-consumer`,
      'socket.keepalive.enable': true,
      'enable.auto.commit': true
    });
  }

  /**
   * @static async - Connect the provided consumer
   * @param {Consumer} consumer - Consumer to connect
   * @returns {Promise<*>} The connected consumer
   */
  static async connectKafkaConsumer(consumer) {
    if (typeof (consumer) === 'undefined') {
      throw new Error('Consumer not defined');
    }
    return new Promise((resolve, reject) => {
      consumer.on('ready', () => resolve(consumer));
      consumer.connect({}, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(consumer);
      });
    });
  }
}

export default KafkaAvroConsumer;
