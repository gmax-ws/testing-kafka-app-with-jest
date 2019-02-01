function getConfigValue(key, defaultValue) {
  if (Object.prototype.hasOwnProperty.call(process.env, key)) {
    return process.env[key];
  }
  return defaultValue;
}

export const inboundTopic = getConfigValue('INBOUND_KAFKA_TOPIC', 'patient');
const inboundKafkaBrokerHost = getConfigValue('INBOUND_KAFKA_BROKER_HOST', 'localhost');
const inboundKafkaBrokerPort = getConfigValue('INBOUND_KAFKA_BROKER_PORT', 9092);
export const inboundKafkaBroker = `${inboundKafkaBrokerHost}:${inboundKafkaBrokerPort}`;
const inboundSchemaRegistryHost = getConfigValue('INBOUND_KAFKA_SCHEMA_REGISTRY_HOST', 'localhost');
const inboundSchemaRegistryPort = getConfigValue('INBOUND_KAFKA_SCHEMA_REGISTRY_PORT', 8081);
const inboundSchemaRegistryProtocol = getConfigValue('INBOUND_KAFKA_SCHEMA_REGISTRY_PROTOCOL', 'http');
export const inboundSchemaRegistry = `${inboundSchemaRegistryProtocol}://${inboundSchemaRegistryHost}:${inboundSchemaRegistryPort}`;

export const outboundTopic = getConfigValue('OUTBOUND_KAFKA_TOPIC', 'patientAdministration');
const outboundKafkaBrokerHost = getConfigValue('OUTBOUND_KAFKA_BROKER_HOST', 'localhost');
const outboundKafkaBrokerPort = getConfigValue('OUTBOUND_KAFKA_BROKER_PORT', 9092);
export const outboundKafkaBroker = `${outboundKafkaBrokerHost}:${outboundKafkaBrokerPort}`;
