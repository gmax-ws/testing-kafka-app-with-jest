/*
 * @jest-environment ./src/kafkaTestEnvironment.js
 */

import {
  eventualQueueMember,
  eventualApiEntry,
  admitPatient,
  findOutboundDischargeMessage,
  findInboundDischargeMessage,
  findSecondInboundTransferMessage,
  formatDate, dischargePatient
} from '../common';
import { v4 as uuid4 } from 'uuid';
import { config } from '../config';

describe('Discharging a patient', () => {
  let producerAppDischargeMessage;
  let adapterAppDischargeMessage;
  let adapterAppTransferMessage;
  let consumerAppPatientRecord;
  let consumerAppWardRecord;
  let consumerAppPatientList;
  let consumerAppWardList;
  const nhsNumber = uuid4();
  const wardCode = '666';
  const admissionDate = new Date(1987, 11, 26, 6, 0, 0);
  const dischargeDate = new Date(1988, 0, 12, 6, 0, 0);
  const patientName = 'Admit Test';

  beforeAll(async () => {
    consumerAppInboundMessages = [];
    producerAppOutboundMessages = [];
    await admitPatient(nhsNumber, wardCode, patientName, admissionDate);
    await dischargePatient(nhsNumber, dischargeDate);
    producerAppDischargeMessage = await eventualQueueMember(
      producerAppOutboundMessages,
      nhsNumber,
      findOutboundDischargeMessage,
      5
    );
    adapterAppDischargeMessage = await eventualQueueMember(
      consumerAppInboundMessages,
      nhsNumber,
      findInboundDischargeMessage,
      5
    );
    adapterAppTransferMessage = await eventualQueueMember(
      consumerAppInboundMessages,
      nhsNumber,
      findSecondInboundTransferMessage,
      10
    );
    consumerAppPatientRecord = await eventualApiEntry(
      `${config.consumerApp.api.host}/patients/${nhsNumber}`,
      {},
      5
    );
    consumerAppWardRecord = await eventualApiEntry(
      `${config.consumerApp.api.host}/wards/${wardCode}`,
      {},
      5
    );
    consumerAppPatientList = await eventualApiEntry(
      `${config.consumerApp.api.host}/patients`,
      {},
      5
    );
    consumerAppWardList = await eventualApiEntry(
      `${config.consumerApp.api.host}/wards`,
      {},
      5
    );
  }, 40000);
  describe('Producer App\'s com.colinwren.Discharge Message', () => {
    it('Has the Discharge body attribute', () => {
      expect(Object.hasOwnProperty.call(producerAppDischargeMessage.body, 'com.colinwren.Discharge')).toBe(true);
    });
    it('Has the patient\'s NHS Number set correctly', () => {
      expect(producerAppDischargeMessage.body['com.colinwren.Discharge'].nhsNumber).toBe(nhsNumber);
    });
    it('Has the correct dischargeDate', () => {
      expect(producerAppDischargeMessage.body['com.colinwren.Discharge'].dischargeDate).toBe(formatDate(dischargeDate));
    });
  });
  describe('Adapter App\'s Discharge Message', () => {
    it('Has the Discharge type', () => {
      expect(adapterAppDischargeMessage.type).toBe('discharge');
    });
    it('Has the patient\'s NHS Number set correctly', () => {
      expect(adapterAppDischargeMessage.nhsNumber).toBe(nhsNumber);
      expect(adapterAppDischargeMessage.data.nhsNumber).toBe(nhsNumber);
    });
    it('Has the correct dischargeDate', () => {
      expect(adapterAppDischargeMessage.data.dischargeDate).toBe(formatDate(dischargeDate));
    });
  });
  describe('Adapter App\'s Transfer Message', () => {
    it('Has the transfer type', () => {
      expect(adapterAppTransferMessage.type).toBe('transfer');
    });
    it('Has the patient\'s NHS Number set correctly', () => {
      expect(adapterAppTransferMessage.nhsNumber).toBe(nhsNumber);
    });
    it('Has the correct toWard code', () => {
      expect(adapterAppTransferMessage.data.toWard).toBe(null);
    });
    it('Has the correct fromWard code', () => {
      expect(adapterAppTransferMessage.data.fromWard).toBe(null);
    });
    it('Has the correct transfer date', () => {
      expect(adapterAppTransferMessage.data.transferDate).toBe(formatDate(dischargeDate));
    });
  });
  describe('Consumer App\'s Patient Resource API Endpoint', () => {
    it('Has the patient\'s name', () => {
      expect(consumerAppPatientRecord.name).toBe(patientName);
    });
    it('Has the patient\'s NHS Number', () => {
      expect(consumerAppPatientRecord.nhsNumber).toBe(nhsNumber);
    });
    it('Has the patient\'s spell', () => {
      expect(consumerAppPatientRecord.spells).toHaveLength(0);
    });
  });
  describe('Consumer App\'s Patient List API Endpoint', () => {
    it('Contains the discharged patient', () => {
      const patientIds = consumerAppPatientList.map((item) => item.nhsNumber);
      expect(patientIds.includes(nhsNumber)).toBe(true);
    });
  });
  describe('Consumer App\'s Ward List API Endpoint', () => {
    it('Contains the ward the patient was admitted to', () => {
      const wardCodes = consumerAppWardList.map((item) => item.code);
      expect(wardCodes.includes(wardCode)).toBe(true);
    });
  });
  describe('Consumer App\'s Ward Resource API Endpoint', () => {
    it('Has the name set to a mix between the location type and the code', () => {
      expect(consumerAppWardRecord.name).toBe(`Ward#${wardCode}`);
    });
    it('Has the location type set to ward', () => {
      expect(consumerAppWardRecord.type).toBe('ward');
    });
    it('Has the ward code set correctly', () => {
      expect(consumerAppWardRecord.code).toBe(wardCode);
    });
    it('Has the patient movements within the ward', () => {
      expect(consumerAppWardRecord.patientMovements.length).toBeGreaterThan(0);
    });
  });
}, 40000);
