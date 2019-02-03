import {
  KafkaClient,
  Consumer
} from 'kafka-node';
import KafkaConsumer from '../KafkaConsumer';

jest.mock('kafka-node');

describe('KafkaConsumer', () => {
  describe('getKafkaClient', () => {
    it('Returns a kafka-node client', () => {
      KafkaConsumer.getKafkaClient();
      expect(KafkaClient).toBeCalled();
    });
  });
  describe('getKafkaConsumerr', () => {
    it('Creates a new instance of Consumer with the passed client', () => {
      KafkaConsumer.getKafkaConsumer(jest.fn());
      expect(Consumer).toBeCalled();
    });
    it('Throws an error if client isnt passed', () => {
      expect(() => KafkaConsumer.getKafkaConsumer()).toThrow();
    });
  });
  describe('constructor', () => {
    let getKafkaClientSpy;
    let getKafkaConsumerSpy;
    beforeEach(() => {
      getKafkaClientSpy = jest.spyOn(KafkaConsumer, 'getKafkaClient');
      getKafkaConsumerSpy = jest.spyOn(KafkaConsumer, 'getKafkaConsumer');
      const consumer = new KafkaConsumer();
      expect(consumer).not.toBe(null);
    });
    it('calls getKafkaClient', () => {
      expect(getKafkaClientSpy).toBeCalled();
    });
    it('calls getKafkaConsumer', () => {
      expect(getKafkaConsumerSpy).toBeCalled();
    });
  });
});
