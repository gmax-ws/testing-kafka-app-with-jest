/** @module Messaging */
import { v4 as uuid } from 'uuid';
/**
 * Send the admission details to the Kafka queue with Avro
 *
 * @param {Object} req - Body should contain name, nhsNumber, admittingWard, admissionDate
 * @param {Object} res - Restify Response Object
 * @param {function} next - function to call after response
 * @param {Object} producer - KafkaProducer instance to publish message to
 */
const sendAdmitMessage = (req, res, next, producer) => {
  const message = {
    body: {
      'com.colinwren.Admit': req.body
    }
  };
  try {
    producer.sendMessageToKafka(`admit-${uuid()}`, message);
  } catch (err) {
    console.log(`error producing admit message: ${err.message}`);
  }
  next();
};

/**
 * Send the discharge details to the Kafka queue with Avro
 *
 * @param {Object} req - Body should contain name, dischargeDate
 * @param {Object} res - Restify Response Object
 * @param {function} next - function to call after response
 * @param {Object} producer - KafkaProducer instance to publish message to
 */
const sendDischargeMessage = (req, res, next, producer) => {
  const message = {
    body: {
      'com.colinwren.Discharge': req.body
    }
  };
  try {
    producer.sendMessageToKafka(`discharge-${uuid()}`, message);
  } catch (err) {
    console.log(`error producing discharge message: ${err.message}`);
  }
  next();
};

/**
 * Send the transfer details to the Kafka queue with Avro
 *
 * @param {Object} req - Body should contain nhsNumber, fromWard, toWard, transferDate
 * @param {Object} res - Restify Response Object
 * @param {function} next - function to call after response
 * @param {Object} producer - KafkaProducer instance to publish message to
 */
const sendTransferMessage = (req, res, next, producer) => {
  const message = {
    body: {
      'com.colinwren.Transfer': req.body
    }
  };
  try {
    producer.sendMessageToKafka(`transfer-${uuid()}`, message);
  } catch (err) {
    console.log(`error producing transfer message: ${err.message}`);
  }
  next();
};

export {
  sendAdmitMessage,
  sendDischargeMessage,
  sendTransferMessage
};
