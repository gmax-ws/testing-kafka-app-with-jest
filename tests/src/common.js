import 'isomorphic-fetch';
import { v4 as uuid4 } from 'uuid';
import { config } from './config';
import { Consumer, KafkaClient, Offset } from 'kafka-node';
import KafkaAvro from 'kafka-avro';

/**
 * Sleep for the specified number of seconds
 *
 * @param {number} seconds - Number of seconds to sleep for
 * @returns {Promise}
 */
export const sleep = async (seconds) => {
  return new Promise(resolve => {
    setTimeout(resolve, (seconds * 1000));
  });
};

/**
 * Attempt to fetch the defined resource and if it's unavailable then retry the defined number of
 * times
 *
 * @param {String} url - URL to attempt
 * @param {Object} options - Options to pass to fetch
 * @param {number} attempts - Number of attempts to make before giving up
 * @returns {Promise<*>} - If successful returns Object from URL
 */
export const eventualApiEntry = async (url, options, attempts = 5) => {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Invalid response received');
  } catch (err) {
    if ( attempts === 1) throw err;
    await sleep(1);
    await eventualApiEntry(url, options, attempts - 1);
  }
};

/**
 * Attempt to find the record with the defined value (needle) within the Array of records (haystack)
 * using the filterFunction provided over the specified number of attempts
 *
 * @param {Object[]} haystack - Array of records
 * @param {String|number} needle - Value used to identify the record
 * @param {function} filterFunction - Function used to filter out the required record
 * @param {number} attempts - Number of attempts to find the record
 * @returns {Promise<*>}
 */
export const eventualQueueMember = async (haystack, needle, filterFunction, attempts = 5) => {
  console.log(`eventualQueueMember - haystack: ${JSON.stringify(haystack)}`);
  const hits = filterFunction(haystack, needle);
  if (hits.length > 0) {
    return hits[0];
  }
  if (attempts === 1) {
    throw new Error(`Failed to get ${needle} in queue`);
  }
  await sleep(1);
  return await eventualQueueMember(haystack, needle, filterFunction, attempts - 1);
};

/**
 * Get the Offset for a topic, used when we need to ensure no old messages are being processed
 * as part of the test run, only applies to kakfa-node instances
 *
 * @param {Object} offset - Kafka-node Offset instance
 * @param {String} topic - Topic to get offset for
 * @returns {Promise} - Offset for the topic
 */
export const getOffset = (offset, topic) => {
  return new Promise((resolve, reject) => {
    return offset.fetchLatestOffsets([topic], (error, offsets) => {
      if (error) {
        reject(error.message);
      }
      resolve(offsets[topic][0]);
    });
  });
};

/**
 * Update the offset on the kafka-node consumer instance so it's only reading new messages
 *
 * @param {Consumer} consumer - kafka-node consumer instance
 * @param {Offset} offset - kafka-node offset instance
 * @returns {Promise<void>}
 */
export const updateConsumerOffset = async (consumer, offset) => {
  const newOffset = await getOffset(offset, config.consumerApp.inboundQueue.topic);
  consumer.setOffset(config.consumerApp.inboundQueue.topic, newOffset, 0);
};

/**
 * Create a Kafka-node Consumer using the provided client and offset
 *
 * @param {KafkaClient} client - Client to use with Kafka
 * @param {Offset} offset - Topic Offset
 * @returns {Promise<Consumer>} Kafka Consumer for consumer-app's inbound topic
 */
export const getKafkaConsumer = async (client, offset) => {
  if (typeof (client) === 'undefined') {
    throw new Error('Client not defined');
  }
  if (typeof (offset) === 'undefined') {
    throw new Error('Offset not defined');
  }
  const deltaOffset = await getOffset(offset, config.consumerApp.inboundQueue.topic);
  const payload = [
    {
      topic: config.consumerApp.inboundQueue.topic,
      offset: deltaOffset,
      partition: 0
    }
  ];
  const options = {
    autoCommit: false,
    fetchMaxWaitMs: 1000,
    fetchMaxBytes: 1024 * 1024,
    fromOffset: true
  };
  return new Consumer(client, payload, options);
};

/**
 * Set up and return the kafka-node consumer and offset for the Consumer App's inbound queue
 *
 * @returns {Promise<{offset: Offset, consumer: Consumer}>}
 */
export const getConsumerAppInboundQueueListener = async () => {
  const client = new KafkaClient( { kafkaHost: config.consumerApp.inboundQueue.host });
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
export const getKafkaAvroClient = async () => {
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
export const getKafkaAvroConsumer = async (client) => {
  if (typeof (client) === 'undefined') {
    throw new Error('client not supplied');
  }
  const consumer = await client.getConsumer({
    'group.id': `end-to-end-test-${uuid4()}`,
    'socket.keepalive.enable': true,
    'enable.auto.commit': false,
    'auto.offset.reset': 'latest'
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
export const getProducerAppOutboundQueueListener = async () => {
  const client = await getKafkaAvroClient();
  return getKafkaAvroConsumer(client);
};

export const formatDate = (date) => {
  return date.getFullYear() + '-' +
    ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
    ('0' + date.getDate()).slice(-2) + 'T' +
    ('0' + date.getHours()).slice(-2) + ':' +
    ('0' + date.getMinutes()).slice(-2) + ':' +
    ('0' + date.getSeconds()).slice(-2) + '000Z';
};

/**
 * Admit patient by sending admission details to the Producer App's /admit endpoint
 *
 * @param {string} nhsNumber - NHS Number for the Patient
 * @param {string} wardCode - Code for the ward to admit patient to
 * @param {string} name - Name of the new patient
 * @returns {Promise<void>}
 */
export const admitPatient = async (nhsNumber, wardCode, name = uuid4()) => {
  const dataToSend = {
    name,
    nhsNumber,
    admittingWard: wardCode,
    admissionDate: formatDate(new Date())
  };
  const options = {
    method: 'POST',
    body: JSON.stringify(dataToSend),
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const admitUrl = `${config.producerApp.api.host}/admit`;
  const response = await fetch(admitUrl, options);
  if (!response.ok) {
    throw new Error(`Error Admitting Patient: ${response.statusText}`);
  }
};

/**
 * Discharge patient by sending discharge details to the Producer App's /discharge endpoint
 *
 * @param {String} nhsNumber -NHS Number for the patient
 * @returns {Promise<void>}
 */
export const dischargePatient = async (nhsNumber) => {
  const dataToSend = {
    nhsNumber,
    dischargeDate: formatDate(new Date())
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToSend)
  };
  const dischargeUrl = `${config.producerApp.api.host}/discharge`;
  const response = await fetch(dischargeUrl, options);
  if (!response.ok) {
    throw new Error(`Error discharging Patient: ${response.statusText}`);
  }
};

/**
 * Transfer patient by sending transfer details to the Producer App's /transfer endpoint
 *
 * @param {String} nhsNumber - NHS Number of the patient
 * @param {String} fromWardCode - Code for the ward being transferred from
 * @param {String} toWardCode - Code for the ward being transferred to
 * @returns {Promise<void>}
 */
export const transferPatient = async (nhsNumber, fromWardCode, toWardCode) => {
  const dataToSend = {
    nhsNumber,
    fromWard: fromWardCode,
    toWard: toWardCode,
    transferDate: formatDate(new Date())
  };
  const options = {
    method: 'POST',
    body: JSON.stringify(dataToSend),
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const transferUrl = `${config.producerApp.api.host}/transfer`;
  const response = await fetch(transferUrl, options);
  if (!response.ok) {
    throw new Error(`Error transferring Patient: ${response.statusText}`);
  }
};

/**
 * Find the Patient's admit message that's sent from the Producer App
 *
 * @param {Object[]} messages - Array of message object
 * @param {string} nhsNumber - NHS Number for the patient
 * @returns {Object[]} - Array of filtered out admit messages for the patient
 */
export const findOutboundAdmitMessage = (messages, nhsNumber) => {
  return messages.filter((message) => {
    const isAdmit = Object.prototype.hasOwnProperty.call(message.body, 'com.colinwren.Admit');
    if (isAdmit && message.body['com.colinwren.Admit'].nhsNumber === nhsNumber) {
      return true;
    }
    return false;
  });
};

/**
 * Find the Patient's discharge message that's sent from the Producer App
 *
 * @param {Object[]} messages - Array of message object
 * @param {string} nhsNumber - NHS Number for the patient
 * @returns {Object[]} - Array of filtered out discharge messages for the patient
 */
export const findOutboundDischargeMessage = (messages, nhsNumber) => {
  return messages.filter((message) => {
    const isDischarge = Object.prototype.hasOwnProperty.call(message.body, 'com.colinwren.Discharge');
    if (isDischarge && message.body['com.colinwren.Discharge'].nhsNumber === nhsNumber) {
      return true;
    }
    return false;
  });
};

/**
* Find the Patient's transfer message that's sent from the Producer App
*
* @param {Object[]} messages - Array of message object
* @param {string} nhsNumber - NHS Number for the patient
* @returns {Object[]} - Array of filtered out transfer messages for the patient
*/
export const findOutboundTransferMessage = (messages, nhsNumber) => {
  return messages.filter((message) => {
    const isTransfer = Object.prototype.hasOwnProperty.call(message.body, 'com.colinwren.Transfer');
    if (isTransfer && message.body['com.colinwren.Transfer'].nhsNumber === nhsNumber) {
      return true;
    }
    return false;
  });
};

/**
 * Find the Patient's admit message that's sent from the Adapter App
 *
 * @param {Object[]} messages - Array of message object
 * @param {string} nhsNumber - NHS Number for the patient
 * @returns {Object[[]} - Array of filtered out admit messages for the patient
 */
export const findInboundAdmitMessage = (messages, nhsNumber) => {
  return messages.filter((message) => message.type === 'admit' && message.nhsNumber === nhsNumber);
};

/**
 * Find the Patient's discharge message that's sent from the Adapter App
 *
 * @param {Object[]} messages - Array of message object
 * @param {string} nhsNumber - NHS Number for the patient
 * @returns {Object[[]} - Array of filtered out discharge messages for the patient
 */
export const findInboundDischargeMessage = (messages, nhsNumber) => {
  return messages.filter((message) => message.type === 'discharge' && message.nhsNumber === nhsNumber);
};

/**
 * Find the Patient's transfer message that's sent from the Adapter App
 *
 * @param {Object[]} messages - Array of message object
 * @param {string} nhsNumber - NHS Number for the patient
 * @returns {Object[[]} - Array of filtered out transfer messages for the patient
 */
export const findInboundTransferMessage = (messages, nhsNumber) => {
  return messages.filter((message) => message.type === 'transfer' && message.nhsNumber === nhsNumber);
};
