function getConfigValue(key, defaultValue) {
  if (Object.prototype.hasOwnProperty.call(process.env, key)) {
    return process.env[key];
  }
  return defaultValue;
}

export const topic = getConfigValue('KAFKA_TOPIC', 'patientAdministration');
const kafkaBrokerHost = getConfigValue('KAFKA_BROKER_HOST', 'localhost');
const kafkaBrokerPort = getConfigValue('KAFKA_BROKER_PORT', 9092);
export const kafkaBroker = `${kafkaBrokerHost}:${kafkaBrokerPort}`;
