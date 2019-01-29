import { sendAdmitMessage, sendDischargeMessage, sendTransferMessage } from '../messaging';

describe('Messaging', () => {
  const nextMock = jest.fn();
  const produceMock = jest.fn();
  const logMock = jest.fn();
  const producer = {
    sendMessageToKafka: produceMock
  };
  describe('Sending an Admit Message', () => {
    const req = {
      body: {
        name: 'Test',
        nhsNumber: '666',
        admittingWard: '1337',
        admissionDate: '1988-01-12T06:00:00.00Z'
      }
    };
    beforeEach(() => {
      nextMock.mockReset();
      produceMock.mockReset();
    });
    it('Sends Message to Kafka Queue', () => {
      sendAdmitMessage(req, jest.fn(), nextMock, producer);
      expect(produceMock.mock.calls[0][0].indexOf('admit-')).toBeGreaterThan(-1);
      expect(produceMock.mock.calls[0][1]).toEqual({ body: { 'com.colinwren.Admit': req.body } });
      expect(nextMock).toBeCalled();
    });
    it('Logs error to console', () => {
      const dodgyProducer = {
        sendMessageToKafka: jest.fn().mockImplementation(() => throw new Error('Oh Bugger'))
      };
      global.console.log = logMock;
      sendAdmitMessage(req, jest.fn(), nextMock, dodgyProducer);
      expect(logMock.mock.calls[0][0]).toBe('error producing admit message: Oh Bugger');
      expect(nextMock).toBeCalled();
    });
  });
  describe('Sending an Discharge Message', () => {
    const req = {
      body: {
        nhsNumber: '666',
        dischargeDate: '1988-01-12T06:00:00.00Z'
      }
    };
    beforeEach(() => {
      nextMock.mockReset();
      produceMock.mockReset();
    });
    it('Sends Message to Kafka Queue', () => {
      sendDischargeMessage(req, jest.fn(), nextMock, producer);
      expect(produceMock.mock.calls[0][0].indexOf('discharge-')).toBeGreaterThan(-1);
      expect(produceMock.mock.calls[0][1]).toEqual({ body: { 'com.colinwren.Discharge': req.body } });
      expect(nextMock).toBeCalled();
    });
    it('Logs error to console', () => {
      const dodgyProducer = {
        sendMessageToKafka: jest.fn().mockImplementation(() => throw new Error('Oh Bugger'))
      };
      global.console.log = logMock;
      sendDischargeMessage(req, jest.fn(), nextMock, dodgyProducer);
      expect(logMock.mock.calls[0][0]).toBe('error producing admit message: Oh Bugger');
      expect(nextMock).toBeCalled();
    });
  });
  describe('Sending an Transfer Message', () => {
    const req = {
      body: {
        nhsNumber: '666',
        fromWard: '666',
        toWard: '666',
        transferDate: '1988-01-12T06:00:00.00Z'
      }
    };
    beforeEach(() => {
      nextMock.mockReset();
      produceMock.mockReset();
    });
    it('Sends Message to Kafka Queue', () => {
      sendTransferMessage(req, jest.fn(), nextMock, producer);
      expect(produceMock.mock.calls[0][0].indexOf('transfer-')).toBeGreaterThan(-1);
      expect(produceMock.mock.calls[0][1]).toEqual({ body: { 'com.colinwren.Transfer': req.body } });
      expect(nextMock).toBeCalled();
    });
    it('Logs error to console', () => {
      const dodgyProducer = {
        sendMessageToKafka: jest.fn().mockImplementation(() => throw new Error('Oh Bugger'))
      };
      global.console.log = logMock;
      sendTransferMessage(req, jest.fn(), nextMock, dodgyProducer);
      expect(logMock.mock.calls[0][0]).toBe('error producing admit message: Oh Bugger');
      expect(nextMock).toBeCalled();
    });
  });
});
