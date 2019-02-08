/** @module KafkaProducer */
import KafkaAvro from 'kafka-avro';
import { topic, kafkaBroker, schemaRegistry } from './config';


/**
* A class for setting up a Avro Kafka Producer and sending messages with it.
*/
class KafkaProducer {
  constructor() {
    return (async () => {
      this.client = KafkaProducer.getKafkaClient();
      await KafkaProducer.initialiseKafkaClient(this.client);
      this.producer = await KafkaProducer.getKafkaProducer(this.client);
      this.setupDisconnectionHandler(KafkaProducer.logDisconnectArguments);
      return this;
    })();
  }

  /**
   * @static getKafkaClient - Use kafka-avro to create a Avro Kafka client
   *
   * @return {KafkaAvro} unitialised Avro Kafka client
   */
  static getKafkaClient() {
    return new KafkaAvro({ kafkaBroker, schemaRegistry, topics: [topic] });
  }

  /**
   * @static async - Initialise the provided KafkaAvro client
   *
   * @param  {KafkaAvro} client KafkaAvro instance
   * @return {void}
   */
  static async initialiseKafkaClient(client) {
    await client.init();
  }

  /**
   * setupDisconnectionHandler - Setup the producer to call the provided
   * function when it receives a disconnected event
   *
   * @param  {function} disconnectionHandler Function to call on disconnect
   * @return {void}
   */
  setupDisconnectionHandler(disconnectionHandler) {
    this.producer.on('disconnected', (args) => disconnectionHandler(args));
  }

  /**
   * @static logDisconnectArguments - output disconnection details to console.log
   *
   * @param  {Object} args Arguments received from disconnect message
   * @return {void}
   */
  static logDisconnectArguments(args) {
    console.log(`disconnected from Kafka: ${JSON.stringify(args)}`);
  }

  /**
   * @static async - get a Producer for the provided KafkaAvro client
   *
   * @param  {KafkaAvro} client Initialised KafkaAvro client
   * @return {Producer} Producer to send messages with
   */
  static async getKafkaProducer(client) {
    return client.getProducer({});
  }

  /**
   * sendMessageToKafka - Send messages using the KafkaProducer instances
   * producer.
   *
   * @param  {String} key   Key to publish message with
   * @param  {Object} value JSON Object to pass as value
   * @return {void}
   */
  sendMessageToKafka(key, value) {
    console.log(`Sending ${key}:${JSON.stringify(value)} to ${topic}`);
    this.producer.produce(topic, -1, value, key);
  }
}

export default KafkaProducer;
