import KafkaAvro, { producerOnMock, producerProduceMock } from 'kafka-avro';
import KafkaProducer from '../KafkaProducer';

jest.mock('kafka-avro');

describe('KafkaProducer', () => {
  describe('getKafkaClient', () => {
    it('Returns a avro-kafka client', () => {
      KafkaProducer.getKafkaClient();
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
      await KafkaProducer.initialiseKafkaClient(testClient);
      expect(testClient.init).toBeCalled();
    });
  });
  describe('getKafkaProducer', () => {
    const testClient = {
      getProducer: jest.fn(() => {
        return new Promise(resolve => resolve());
      })
    };
    it('Calls the getProducer() function on the passed client', async () => {
      await KafkaProducer.getKafkaProducer(testClient);
      expect(testClient.getProducer).toBeCalled();
    });
  });
  describe('logDisconnectArguments', () => {
    it('Sends a stringified version of the disconnect args to console.log', () => {
      const logMock = jest.fn();
      global.console.log = logMock;
      KafkaProducer.logDisconnectArguments({ test: 'arguments' });
      expect(logMock.mock.calls[0][0]).toBe('disconnected from Kafka: {"test":"arguments"}');
    });
  });
  describe('constructor', () => {
    let getKafkaClientSpy;
    let initialiseKafkaClientSpy;
    let getKafkaProducerSpy;
    let setupDisconnectionHandlerSpy;
    beforeEach(async () => {
      getKafkaClientSpy = jest.spyOn(KafkaProducer, 'getKafkaClient');
      initialiseKafkaClientSpy = jest.spyOn(KafkaProducer, 'initialiseKafkaClient');
      getKafkaProducerSpy = jest.spyOn(KafkaProducer, 'getKafkaProducer');
      setupDisconnectionHandlerSpy = jest.spyOn(KafkaProducer.prototype, 'setupDisconnectionHandler');
      await new KafkaProducer();
    });
    it('calls getKafkaClient', () => {
      expect(getKafkaClientSpy).toBeCalled();
    });
    it('calls initialiseKafkaClient', () => {
      expect(initialiseKafkaClientSpy).toBeCalled();
    });
    it('calls getKafkaProducer', () => {
      expect(getKafkaProducerSpy).toBeCalled();
    });
    it('calls setupDisconnectionHandler', () => {
      expect(setupDisconnectionHandlerSpy).toBeCalled();
    });
  });
  describe('setupDisconnectionHandler', () => {
    beforeAll(async () => {
      await new KafkaProducer();
    });
    it('Calls this.producer.on with a function', () => {
      expect(typeof (producerOnMock.mock.calls[0][1])).toBe('function');
    });
    it('Calls this.producer.on with the disconnected event name', () => {
      expect(producerOnMock.mock.calls[0][0]).toBe('disconnected');
    });
  });
  describe('sendMessageToKafka', () => {
    beforeAll(async () => {
      const producer = await new KafkaProducer();
      producer.sendMessageToKafka('test', { test: 'message' });
    });
    it('Uses the topic defined in config', () => {
      expect(producerProduceMock.mock.calls[0][0]).toBe('patient');
    });
    it('Uses -1 for the partition', () => {
      expect(producerProduceMock.mock.calls[0][1]).toBe(-1);
    });
    it('Uses the provided key for the message', () => {
      expect(producerProduceMock.mock.calls[0][3]).toBe('test');
    });
    it('Uses the provided value for the message', () => {
      expect(producerProduceMock.mock.calls[0][2]).toEqual({ test: 'message' });
    });
  });
});
