const getEnvVar = (key, safeDefault) => {
  if (Object.prototype.hasOwnProperty.call(process.env, key) && !(typeof (process.env[key]) === 'undefined')) {
    return process.env[key];
  }
  return safeDefault;
};

module.exports = {
  config: {
    producerApp: {
      api: {
        host: getEnvVar('PRODUCER_APP_API_HOST', 'http://localhost:8080')
      },
      outboundQueue: {
        host: getEnvVar('PRODUCER_APP_OUTBOUND_HOST', 'localhost:9092'),
        topic: getEnvVar('PRODUCER_APP_OUTBOUND_TOPIC', 'patient'),
        schemaRegistry: getEnvVar('PRODUCER_APP_OUTBOUND_SCHEMA_REGISTRY', 'http://localhost:8081')
      }
    },
    consumerApp: {
      api: {
        host: getEnvVar('CONSUMER_APP_API_HOST', 'http://localhost:8082')
      },
      inboundQueue: {
        host: getEnvVar('CONSUMER_APP_INBOUND_HOST', 'localhost:9092'),
        topic: getEnvVar('CONSUMER_APP_INBOUND_TOPIC', 'patientAdministration')
      }
    }
  }
};
