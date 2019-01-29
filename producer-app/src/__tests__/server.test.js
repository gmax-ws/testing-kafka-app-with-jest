import { admit, discharge, transfer } from '../server';

describe('Server endpoints', () => {
  const sendMock = jest.fn();
  const nextMock = jest.fn();
  const testResponse = {
    send: sendMock
  };
  describe('Admit endpoint', () => {
    beforeEach(() => {
      sendMock.mockReset();
      nextMock.mockReset();
    });
    const testRequest = {
      body: {
        name: 'Test Patient',
        nhsNumber: '666',
        admittingWard: '1337',
        admissionDate: '1988-01-12T06:00:00.000Z'
      }
    };
    it('Calls res.send() with a 201 response when correct data passed', () => {
      admit(testRequest, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(201);
      expect(nextMock).toBeCalled();
    });
    it('Calls res.send() with a 400 when name not passed', () => {
      const { name, ...nameLess } = testRequest.body;
      admit({ body: nameLess }, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(400);
      expect(sendMock.mock.calls[0][1]).toEqual({ error: 'name values not present in body' });
      expect(nextMock).not.toBeCalled();
    });
    it('Calls res.send() with a 400 when nhsNumber not passed', () => {
      const { nhsNumber, ...numberLess } = testRequest.body;
      admit({ body: numberLess }, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(400);
      expect(sendMock.mock.calls[0][1]).toEqual({ error: 'nhsNumber values not present in body' });
      expect(nextMock).not.toBeCalled();
    });
    it('Calls res.send() with a 400 when admittingWard not passed', () => {
      const { admittingWard, ...wardLess } = testRequest.body;
      admit({ body: wardLess }, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(400);
      expect(sendMock.mock.calls[0][1]).toEqual({ error: 'admittingWard values not present in body' });
      expect(nextMock).not.toBeCalled();
    });
    it('Calls res.send() with a 400 when admissionDate not passed', () => {
      const { admissionDate, ...dateLess } = testRequest.body;
      admit({ body: dateLess }, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(400);
      expect(sendMock.mock.calls[0][1]).toEqual({ error: 'admissionDate values not present in body' });
      expect(nextMock).not.toBeCalled();
    });
  });
  describe('Discharge endpoint', () => {
    beforeEach(() => {
      sendMock.mockReset();
      nextMock.mockReset();
    });
    const testRequest = {
      body: {
        nhsNumber: '666',
        dischargeDate: '1988-01-12T06:00:00.000Z'
      }
    };
    it('Calls res.send() with a 202 response when correct data passed', () => {
      discharge(testRequest, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(202);
      expect(nextMock).toBeCalled();
    });
    it('Calls res.send() with a 400 when nhsNumber not passed', () => {
      const { nhsNumber, ...numberLess } = testRequest.body;
      discharge({ body: numberLess }, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(400);
      expect(sendMock.mock.calls[0][1]).toEqual({ error: 'nhsNumber values not present in body' });
      expect(nextMock).not.toBeCalled();
    });
    it('Calls res.send() with a 400 when dischargeDate not passed', () => {
      const { dischargeDate, ...dateLess } = testRequest.body;
      discharge({ body: dateLess }, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(400);
      expect(sendMock.mock.calls[0][1]).toEqual({ error: 'dischargeDate values not present in body' });
      expect(nextMock).not.toBeCalled();
    });
  });
  describe('Transfer endpoint', () => {
    beforeEach(() => {
      sendMock.mockReset();
      nextMock.mockReset();
    });
    const testRequest = {
      body: {
        nhsNumber: '666',
        toWard: '1337',
        fromWard: '666',
        transferDate: '1988-01-12T06:00:00.000Z'
      }
    };
    it('Calls res.send() with a 200 response when correct data passed', () => {
      transfer(testRequest, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(200);
      expect(nextMock).toBeCalled();
    });
    it('Calls res.send() with a 400 when nhsNumber not passed', () => {
      const { nhsNumber, ...numberLess } = testRequest.body;
      transfer({ body: numberLess }, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(400);
      expect(sendMock.mock.calls[0][1]).toEqual({ error: 'nhsNumber values not present in body' });
      expect(nextMock).not.toBeCalled();
    });
    it('Calls res.send() with a 400 when toWard not passed', () => {
      const { toWard, ...wardLess } = testRequest.body;
      transfer({ body: wardLess }, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(400);
      expect(sendMock.mock.calls[0][1]).toEqual({ error: 'toWard values not present in body' });
      expect(nextMock).not.toBeCalled();
    });
    it('Calls res.send() with a 400 when fromWard not passed', () => {
      const { fromWard, ...wardLess } = testRequest.body;
      transfer({ body: wardLess }, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(400);
      expect(sendMock.mock.calls[0][1]).toEqual({ error: 'fromWard values not present in body' });
      expect(nextMock).not.toBeCalled();
    });
    it('Calls res.send() with a 400 when transferDate not passed', () => {
      const { transferDate, ...dateLess } = testRequest.body;
      transfer({ body: dateLess }, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(400);
      expect(sendMock.mock.calls[0][1]).toEqual({ error: 'transferDate values not present in body' });
      expect(nextMock).not.toBeCalled();
    });
  });
});
