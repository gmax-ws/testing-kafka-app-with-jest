import {
  KafkaClient,
  Producer,
  sendMock,
  onMock
} from 'kafka-node';
import KafkaProducer from '../KafkaProducer';
import { outboundTopic } from '../config';

jest.mock('kafka-node');

describe('KafkaProducer', () => {
  describe('getKafkaClient', () => {
    it('Returns a kafka-node client', () => {
      KafkaProducer.getKafkaClient();
      expect(KafkaClient).toBeCalled();
    });
  });
  describe('getKafkaProducer', () => {
    it('Creates an instance of Producer with the passed client', async () => {
      await KafkaProducer.getKafkaProducer(jest.fn());
      expect(Producer).toBeCalled();
      expect(onMock).toBeCalled();
    });
    it('Throws an error if client isnt passed', async () => {
      await expect(KafkaProducer.getKafkaProducer()).rejects.toThrow();
    });
  });
  describe('constructor', () => {
    let getKafkaClientSpy;
    let getKafkaProducerSpy;
    beforeEach(async () => {
      getKafkaClientSpy = jest.spyOn(KafkaProducer, 'getKafkaClient');
      getKafkaProducerSpy = jest.spyOn(KafkaProducer, 'getKafkaProducer');
      await new KafkaProducer();
    });
    it('calls getKafkaClient', () => {
      expect(getKafkaClientSpy).toBeCalled();
    });
    it('calls getKafkaProducer', () => {
      expect(getKafkaProducerSpy).toBeCalled();
    });
  });
  describe('sendMessageToKafka', () => {
    beforeAll(async () => {
      const producer = await new KafkaProducer();
      producer.sendMessageToKafka([{ test: 'message' }]);
    });
    it('Uses the topic defined in config', () => {
      expect(sendMock.mock.calls[0][0]).toHaveLength(1);
      expect(sendMock.mock.calls[0][0][0]).toEqual({
        topic: outboundTopic,
        messages: ['{"test":"message"}']
      });
    });
  });
  describe('handleMessageSent', () => {
    it('logs errors to console', () => {
      const logMock = jest.fn();
      global.console.log = logMock;
      KafkaProducer.handleMessageSent({ message: 'Oh Noes!' }, {});
      expect(logMock.mock.calls[0][0]).toBe('Error when sending message: Oh Noes!');
    });
  });
});
