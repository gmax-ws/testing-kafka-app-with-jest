/** @module kafkaTestEnvironment */
const KafkaAvro = require('kafka-avro');
const { config } = require('./config');
const uuid4 = require('uuid').v4;
const NodeEnvironment = require('jest-environment-node');
const { Consumer, KafkaClient, Offset } = require('kafka-node');

/**
 * Sleep for the specified number of seconds
 *
 * @param {number} seconds - Number of seconds to sleep for
 * @returns {Promise}
 */
const sleep = async (seconds) => {
  return new Promise(resolve => {
    setTimeout(resolve, (seconds * 1000));
  });
};

/**
 * Get the Offset for a topic, used when we need to ensure no old messages are being processed
 * as part of the test run, only applies to kakfa-node instances
 *
 * @param {Object} offset - Kafka-node Offset instance
 * @param {String} topic - Topic to get offset for
 * @returns {Promise} - Offset for the topic
 */
const getOffset = (offset, topic) => {
  return new Promise((resolve, reject) => {
    return offset.fetchLatestOffsets([topic], (error, offsets) => {
      if (error) {
        reject(error.message);
      }
      resolve(offsets[topic]);
    });
  });
};

/**
 * Create a Kafka-node Consumer using the provided client and offset
 *
 * @param {KafkaClient} client - Client to use with Kafka
 * @param {Offset} offset - Topic Offset
 * @returns {Promise<Consumer>} Kafka Consumer for consumer-app's inbound topic
 */
const getKafkaConsumer = async (client, offset) => {
  if (typeof (client) === 'undefined') {
    throw new Error('Client not defined');
  }
  if (typeof (offset) === 'undefined') {
    throw new Error('Offset not defined');
  }
  const deltaOffsets = await getOffset(offset, config.consumerApp.inboundQueue.topic);
  const payloads = Object.keys(deltaOffsets).map((key) => {
    return {
      topic: config.consumerApp.inboundQueue.topic,
      offset: deltaOffsets[key],
      partition: parseInt(key, 10)
    };
  });
  const options = {
    autoCommit: false,
    fetchMaxWaitMs: 1000,
    fetchMaxBytes: 1024 * 1024,
    fromOffset: true
  };
  return new Consumer(client, payloads, options);
};

/**
 * Set up and return the kafka-node consumer and offset for the Consumer App's inbound queue
 *
 * @returns {Promise<{offset: Offset, consumer: Consumer}>}
 */
const getConsumerAppInboundQueueListener = async () => {
  const client = new KafkaClient({ kafkaHost: config.consumerApp.inboundQueue.host });
  const offset = new Offset(client);
  const consumer = await getKafkaConsumer(client, offset);
  return {
    offset,
    consumer
  };
};


/**
 * Set up the kafka-avro client
 *
 * @returns {Promise<*>}
 */
const getKafkaAvroClient = async () => {
  const client = new KafkaAvro(
    {
      kafkaBroker: config.producerApp.outboundQueue.host,
      schemaRegistry: config.producerApp.outboundQueue.schemaRegistry,
      topics: [config.producerApp.outboundQueue.topic],
      fetchAllVersions: true
    }
  );
  await client.init();
  return client;
};

/**
 * Create a Consumer using the kafka-avro Client
 *
 * @param {KafkaAvro} client - Kafka-avro client instance
 * @returns {Promise} kafka-avro consumer
 */
const getKafkaAvroConsumer = async (client) => {
  if (typeof (client) === 'undefined') {
    throw new Error('client not supplied');
  }
  const consumer = await client.getConsumer({
    'group.id': `end-to-end-test-${uuid4()}`,
    'socket.keepalive.enable': true,
    'enable.auto.commit': false
  });
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
};

/**
 * Set up and return the kafka-avro consumer for the Producer App's outbound queue
 *
 * @returns {Promise<void>}
 */
const getProducerAppOutboundQueueListener = async () => {
  const client = await getKafkaAvroClient();
  const consumer = await getKafkaAvroConsumer(client);
  consumer.subscribe([config.producerApp.outboundQueue.topic]);
  consumer.consume();
  return consumer;
};


class KafkaTestEnvironment extends NodeEnvironment {
  constructor(appConfig) {
    super(appConfig);
    this.consumerAppInboundConsumer = null;
    this.producerAppOutboundConsumer = null;
    this.global.consumerAppInboundMessages = [];
    this.global.producerAppOutboundMessages = [];
  }

  async setup() {
    await super.setup();
    const { consumer } = await getConsumerAppInboundQueueListener();
    this.consumerAppInboundConsumer = consumer;
    this.producerAppOutboundConsumer = await getProducerAppOutboundQueueListener();

    this.producerAppOutboundConsumer.on('data', data => {
      console.log('Got message from patient queue');
      this.global.producerAppOutboundMessages.push(data.parsed);
    });
    this.consumerAppInboundConsumer.on('message', (message) => {
      console.log('Got message from patientAdministration queue');
      this.global.consumerAppInboundMessages.push(JSON.parse(message.value));
    });
    await sleep(10);
  }

  async teardown() {
    this.consumerAppInboundConsumer.close();
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = KafkaTestEnvironment;
