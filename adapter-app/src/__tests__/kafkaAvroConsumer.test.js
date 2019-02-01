import KafkaAvro from 'kafka-avro';
import KafkaAvroConsumer from '../kafkaAvroConsumer';

jest.mock('kafka-avro');

describe('KafkaAvroConsumer', () => {
  describe('getKafkaClient', () => {
    it('Returns a avro-kafka client', () => {
      KafkaAvroConsumer.getKafkaClient();
      expect(KafkaAvro).toBeCalled();
    });
  });
  describe('initialiseKafkaClient', () => {
    const testClient = {
      init: jest.fn(() => {
        return new Promise(resolve => resolve());
      })
    };
    it('Calls the init() function on the passed client', async () => {
      await KafkaAvroConsumer.initialiseKafkaClient(testClient);
      expect(testClient.init).toBeCalled();
    });
    it('Throws an error if no client is passed', async () => {
      await expect(KafkaAvroConsumer.initialiseKafkaClient()).rejects.toThrow();
    });
  });
  describe('getKafkaConsumer', () => {
    const testClient = {
      getConsumer: jest.fn(() => {
        return new Promise((resolve) => resolve());
      })
    };
    it('Calls the getConsumer() function on the passed client', async () => {
      await KafkaAvroConsumer.getKafkaConsumer(testClient);
      expect(testClient.getConsumer).toBeCalled();
    });
    it('Throws an error if no client is passed', async () => {
      await expect(KafkaAvroConsumer.getKafkaConsumer()).rejects.toThrow();
    });
  });
  describe('connectKafkaConsumer', () => {
    const testConsumer = {
      on: jest.fn((eventName, callback) => callback()),
      connect: jest.fn((data, callback) => callback())
    };
    beforeAll(async () => {
      await KafkaAvroConsumer.connectKafkaConsumer(testConsumer);
    });
    it('Sets up a listener for the ready message', () => {
      expect(testConsumer.on.mock.calls[0][0]).toBe('ready');
    });
    it('Connects the consumer', () => {
      expect(testConsumer.connect).toBeCalled();
    });
    it('Throws an error if no consumer is passed', async () => {
      await expect(KafkaAvroConsumer.connectKafkaConsumer()).rejects.toThrow();
    });
  });
  describe('constructor', () => {
    let getKafkaClientSpy;
    let initialiseKafkaClientSpy;
    let getKafkaConsumerSpy;
    let connectKafkaConsumerSpy;
    beforeEach(async () => {
      getKafkaClientSpy = jest.spyOn(KafkaAvroConsumer, 'getKafkaClient');
      initialiseKafkaClientSpy = jest.spyOn(KafkaAvroConsumer, 'initialiseKafkaClient');
      getKafkaConsumerSpy = jest.spyOn(KafkaAvroConsumer, 'getKafkaConsumer');
      connectKafkaConsumerSpy = jest.spyOn(KafkaAvroConsumer, 'connectKafkaConsumer');
      await new KafkaAvroConsumer();
    });
    it('calls getKafkaClient', () => {
      expect(getKafkaClientSpy).toBeCalled();
    });
    it('calls initialiseKafkaClient', () => {
      expect(initialiseKafkaClientSpy).toBeCalled();
    });
    it('calls getKafkaConsumer', () => {
      expect(getKafkaConsumerSpy).toBeCalled();
    });
    it('calls connectKafkaConsumer', () => {
      expect(connectKafkaConsumerSpy).toBeCalled();
    });
  });
});
