/** @module KafkaConsumer */
import { Consumer, KafkaClient } from 'kafka-node';
import { kafkaBroker, topic } from './config';


/**
* A class for setting up a Kafka Consumer and sending messages with it.
*/
class KafkaConsumer {
  constructor() {
    this.client = KafkaConsumer.getKafkaClient();
    this.consumer = KafkaConsumer.getKafkaConsumer(this.client);
  }

  /**
   * @static getKafkaClient - Use kafka-node to create a Kafka client
   *
   * @return {KafkaClient}  Kafka client
   */
  static getKafkaClient() {
    return new KafkaClient({ kafkaHost: kafkaBroker });
  }

  /**
   * @static - get a Consumer for the provided KafkaClient
   *
   * @param  {KafkaClient} Kafka client
   * @return {Consumer} Consumer to send messages with
   */
  static getKafkaConsumer(client) {
    if (typeof (client) === 'undefined') {
      throw new Error('Client not defined');
    }
    return new Consumer(client, [{ topic }], { groupId: 'consumer-app' });
  }
}

export default KafkaConsumer;
