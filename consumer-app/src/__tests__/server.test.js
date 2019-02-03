import {
  listWards,
  getWard,
  listPatients,
  getPatient
} from '../server';
import { wardLocation, testPatient } from '../testData';

jest.mock('../models');

describe('API Server functions', () => {
  const sendMock = jest.fn();
  const nextMock = jest.fn();
  const testResponse = {
    send: sendMock
  };
  describe('listWards()', () => {
    beforeEach(() => {
      sendMock.mockReset();
      nextMock.mockReset();
    });
    it('Returns list of ward objects', async () => {
      await listWards({}, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(200);
      expect(sendMock.mock.calls[0][1]).toHaveLength(1);
      expect(sendMock.mock.calls[0][1][0]).toEqual(wardLocation);
      expect(nextMock).toBeCalled();
    });
  });
  describe('getWard()', () => {
    beforeEach(() => {
      sendMock.mockReset();
      nextMock.mockReset();
    });
    it('Returns ward object', async () => {
      await getWard({ params: { id: 1 } }, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(200);
      expect(sendMock.mock.calls[0][1]).toEqual(wardLocation);
      expect(nextMock).toBeCalled();
    });
  });
  describe('listPatients()', () => {
    beforeEach(() => {
      sendMock.mockReset();
      nextMock.mockReset();
    });
    it('Returns list of patient objects', async () => {
      await listPatients({}, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(200);
      expect(sendMock.mock.calls[0][1]).toHaveLength(1);
      expect(sendMock.mock.calls[0][1][0]).toEqual(testPatient);
      expect(nextMock).toBeCalled();
    });
  });
  describe('getPatient()', () => {
    beforeEach(() => {
      sendMock.mockReset();
      nextMock.mockReset();
    });
    it('Returns patient object', async () => {
      await getPatient({ params: { id: 1 } }, testResponse, nextMock);
      expect(sendMock.mock.calls[0][0]).toBe(200);
      expect(sendMock.mock.calls[0][1]).toEqual(testPatient);
      expect(nextMock).toBeCalled();
    });
  });
});
