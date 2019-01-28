/**
 * Send the admission details to the Kafka queue with Avro
 *
 * @param {Object} req - Body should contain name, nhsNumber, admittingWard, admissionDate
 * @param {Object} res - Restify Response Object
 * @param {function} next - function to call after response
 * @param {Object} producer - KafkaProducer instance to publish message to
 */
const sendAdmitMessage = (req, res, next, producer) => {
  console.log('sending admit message');
  try {
    producer.sendMessageToKafka('admit', { test: 'message' });
  } catch (err) {
    console.log(`error producing message ${err.message}`);
  }
  next();
};

/**
 * Send the discharge details to the Kafka queue with Avro
 *
 * @param {Object} req - Body should contain name, dischargeDate
 * @param {Object} res - Restify Response Object
 * @param {function} next - function to call after response
 */
const sendDischargeMessage = (req, res, next) => {
  next();
};

/**
 * Send the transfer details to the Kafka queue with Avro
 *
 * @param {Object} req - Body should contain nhsNumber, fromWard, toWard, transferDate
 * @param {Object} res - Restify Response Object
 * @param {function} next - function to call after response
 */
const sendTransferMessage = (req, res, next) => {
  next();
};

export {
  sendAdmitMessage,
  sendDischargeMessage,
  sendTransferMessage
};