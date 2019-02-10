function getConfigValue(key, defaultValue) {
  if (Object.prototype.hasOwnProperty.call(process.env, key)) {
    return process.env[key];
  }
  return defaultValue;
}

export const topic = getConfigValue('KAFKA_TOPIC', 'patient');
const kafkaBrokerHost = getConfigValue('KAFKA_BROKER_HOST', 'localhost');
const kafkaBrokerPort = getConfigValue('KAFKA_BROKER_PORT', 9092);
export const kafkaBroker = `${kafkaBrokerHost}:${kafkaBrokerPort}`;
const schemaRegistryHost = getConfigValue('KAFKA_SCHEMA_REGISTRY_HOST', 'localhost');
const schemaRegistryPort = getConfigValue('KAFKA_SCHEMA_REGISTRY_PORT', 8081);
const schemaRegistryProtocol = getConfigValue('KAFKA_SCHEMA_REGISTRY_PROTOCOL', 'http');
export const schemaRegistry = `${schemaRegistryProtocol}://${schemaRegistryHost}:${schemaRegistryPort}`;
