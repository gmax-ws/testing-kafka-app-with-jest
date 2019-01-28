import { sendAdmitMessage, sendDischargeMessage, sendTransferMessage } from '../messaging';

describe('Messaging', () => {
  const nextMock = jest.fn();
  const produceMock = jest.fn();
  const producer = {
    produce: produceMock,
  };
  describe('Sending an Admit Message', () => {
    beforeEach(() => {
      nextMock.mockReset();
      produceMock.mockReset();
    });
    it('Calls next()', () => {
      sendAdmitMessage(null, null, nextMock, producer);
      expect(nextMock).toBeCalled();
    });
  });
  describe('Sending an Discharge Message', () => {
    beforeEach(() => {
      nextMock.mockReset();
      produceMock.mockReset();
    });
    it('Calls next()', () => {
      sendDischargeMessage(null, null, nextMock);
      expect(nextMock).toBeCalled();
    });
  });
  describe('Sending an Transfer Message', () => {
    beforeEach(() => {
      nextMock.mockReset();
      produceMock.mockReset();
    });
    it('Calls next()', () => {
      sendTransferMessage(null, null, nextMock);
      expect(nextMock).toBeCalled();
    });
  });
});