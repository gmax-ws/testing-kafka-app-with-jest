/** @module KafkaProducer */
import { Producer, KafkaClient } from 'kafka-node';
import { outboundKafkaBroker, outboundTopic } from './config';


/**
* A class for setting up a Avro Kafka Producer and sending messages with it.
*/
class KafkaProducer {
  constructor() {
    return (async () => {
      this.client = KafkaProducer.getKafkaClient();
      this.producer = await KafkaProducer.getKafkaProducer(this.client);
      return this;
    })();
  }

  /**
   * @static getKafkaClient - Use kafka-avro to create a Avro Kafka client
   *
   * @return {KafkaClient} unitialised Avro Kafka client
   */
  static getKafkaClient() {
    return new KafkaClient({ kafkaHost: outboundKafkaBroker });
  }

  /**
   * @static - get a Producer for the provided KafkaAvro client
   *
   * @param  {KafkaAvro} client Initialised KafkaAvro client
   * @return {Producer} Producer to send messages with
   */
  static async getKafkaProducer(client) {
    return new Promise((resolve, reject) => {
      const producer = new Producer(client);
      producer.on('ready', (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(producer);
      });
    });
  }

  /**
   * Handle message sent callback
   *
   * @param {Object} err - Error thrown when failing to send message
   * @param {Object} data - Data sent
   */
  static handleMessageSent(err, data) {
    if (err) {
      console.log(`Error when sending message: ${err.message}`);
    }
  }

  /**
   * sendMessageToKafka - Send messages using the KafkaProducer instances
   * producer.
   *
   * @param  {String[]} messages - Messages to send to the Kafka Queue
   * @return {void}
   */
  sendMessageToKafka(messages) {
    messages.map((item) => console.log(item));
    const payload = {
      topic: outboundTopic,
      messages
    };
    this.producer.send([payload], KafkaProducer.handleMessageSent);
  }
}

export default KafkaProducer;
