import { KafkaClient, Producer, sendMock, onMock } from 'kafka-node';
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
    it('Calls the getProducer() function on the passed client', async () => {
      await KafkaProducer.getKafkaProducer(jest.fn());
      expect(Producer).toBeCalled();
      expect(onMock).toBeCalled();
    });
  });
  describe('constructor', () => {
    let getKafkaClientSpy;
    let getKafkaProducerSpy;
    beforeEach(async () => {
      getKafkaClientSpy = jest.spyOn(KafkaProducer, 'getKafkaClient');
      getKafkaProducerSpy = jest.spyOn(KafkaProducer, 'getKafkaProducer');
      const testProducer = await new KafkaProducer();
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
      expect(sendMock.mock.calls[0][0].length).toBe(1);
      expect(sendMock.mock.calls[0][0][0]).toEqual({
        topic: outboundTopic,
        messages: [ { test: 'message' }]
      });
    });
  });
});
