/** @module KafkaProducer */
import { Producer, KafkaClient } from 'kafka-node';
import { outboundKafkaBroker, outboundTopic } from './config';


/**
* A class for setting up a Avro Kafka Producer and sending messages with it.
*/
class KafkaProducer {
  constructor() {
    this.client = KafkaProducer.getKafkaClient();
    this.producer = KafkaProducer.getKafkaProducer(this.client);
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
  static getKafkaProducer(client) {
    return new Producer(client);
  }

  /**
   * sendMessageToKafka - Send messages using the KafkaProducer instances
   * producer.
   *
   * @param  {String} key   Key to publish message with
   * @param  {Object} value JSON Object to pass as value
   * @return {void}
   */
  sendMessageToKafka(value) {
    this.producer.send({
      topic: outboundTopic,
      messages: [value]
    });
  }
}

export default KafkaProducer;
