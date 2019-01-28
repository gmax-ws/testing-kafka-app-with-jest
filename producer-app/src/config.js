function getConfigValue(key, defaultValue) {
  if (Object.prototype.hasOwnProperty.call(process.env, key)) {
    return process.env[key];
  }
  return defaultValue;
}

export const topic = getConfigValue('KAFKA_TOPIC', 'test');
export const kafkaBroker = getConfigValue('KAFKA_BROKER', 'localhost:9092');
export const schemaRegistry = getConfigValue('KAFKA_SCHEMA_REGISTRY', 'http://localhost:8081');
