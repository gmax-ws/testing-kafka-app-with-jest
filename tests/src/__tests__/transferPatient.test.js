/*
 * @jest-environment ./src/kafkaTestEnvironment.js
 */

import {
  eventualQueueMember,
  eventualApiEntry,
  admitPatient,
  findOutboundTransferMessage,
  findSecondInboundTransferMessage,
  formatDate,
  transferPatient,
  sleep
} from '../common';
import { v4 as uuid4 } from 'uuid';
import { config } from '../config';

describe('Transferring a patient', () => {
  let producerAppTransferMessage;
  let adapterAppTransferMessage;
  let consumerAppPatientRecord;
  let consumerAppFromWardRecord;
  let consumerAppToWardRecord;
  let consumerAppPatientList;
  let consumerAppWardList;
  let consumerAppSpellRecord;
  let consumerAppTransferPatientMovementRecord;
  let consumerAppAdmitPatientMovementRecord;
  const nhsNumber = uuid4();
  const wardCode = '666';
  const newWardCode = '1337';
  const admissionDate = new Date(1987, 11, 26, 6, 0, 0);
  const transferDate = new Date(1988, 0, 12, 6, 0, 0);
  const patientName = 'Admit Test';

  beforeAll(async () => {
    consumerAppInboundMessages = [];
    producerAppOutboundMessages = [];
    await admitPatient(nhsNumber, wardCode, patientName, admissionDate);
    await transferPatient(nhsNumber, wardCode, newWardCode, transferDate);
    producerAppTransferMessage = await eventualQueueMember(
      producerAppOutboundMessages,
      nhsNumber,
      findOutboundTransferMessage,
      15
    );
    adapterAppTransferMessage = await eventualQueueMember(
      consumerAppInboundMessages,
      nhsNumber,
      findSecondInboundTransferMessage,
      15
    );
    // Sleep for 2 seconds to allow for message to be processed and API updated
    await sleep(2);
    consumerAppPatientRecord = await eventualApiEntry(
      `${config.consumerApp.api.host}/patients/${nhsNumber}`,
      {},
      5
    );
    consumerAppFromWardRecord = await eventualApiEntry(
      `${config.consumerApp.api.host}/wards/${wardCode}`,
      {},
      5
    );
    consumerAppToWardRecord = await eventualApiEntry(
      `${config.consumerApp.api.host}/wards/${newWardCode}`,
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
    consumerAppSpellRecord = consumerAppPatientRecord.spells[0];
    consumerAppAdmitPatientMovementRecord = consumerAppSpellRecord.patientMovements[1];
    consumerAppTransferPatientMovementRecord = consumerAppSpellRecord.patientMovements[0];
  }, 57000);
  describe('Producer App\'s com.colinwren.Transfer Message', () => {
    it('Has the transfer body attribute', () => {
      expect(Object.hasOwnProperty.call(producerAppTransferMessage.body, 'com.colinwren.Transfer')).toBe(true);
    });
    it('Has the patient\'s NHS Number set correctly', () => {
      expect(producerAppTransferMessage.body['com.colinwren.Transfer'].nhsNumber).toBe(nhsNumber);
    });
    it('Has the toWard set correctly', () => {
      expect(producerAppTransferMessage.body['com.colinwren.Transfer'].toWard).toBe(newWardCode);
    });
    it('Has the fromWard set correctly', () => {
      expect(producerAppTransferMessage.body['com.colinwren.Transfer'].fromWard).toBe(wardCode);
    });
    it('Has the correct transferDate', () => {
      expect(producerAppTransferMessage.body['com.colinwren.Transfer'].transferDate).toBe(formatDate(transferDate));
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
      expect(adapterAppTransferMessage.data.toWard).toBe(newWardCode);
    });
    it('Has the correct fromWard code', () => {
      expect(adapterAppTransferMessage.data.fromWard).toBe(wardCode);
    });
    it('Has the correct transfer date', () => {
      expect(adapterAppTransferMessage.data.transferDate).toBe(formatDate(transferDate));
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
      expect(consumerAppPatientRecord.spells).toHaveLength(1);
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
    it('Contains the ward the patient was transfer to', () => {
      const wardCodes = consumerAppWardList.map((item) => item.code);
      expect(wardCodes.includes(newWardCode)).toBe(true);
    });
  });
  describe('Consumer App\'s Ward Resource API Endpoint - Ward transferred from', () => {
    it('Has the name set to a mix between the location type and the code', () => {
      expect(consumerAppFromWardRecord.name).toBe(`Ward#${wardCode}`);
    });
    it('Has the location type set to ward', () => {
      expect(consumerAppFromWardRecord.type).toBe('ward');
    });
    it('Has the ward code set correctly', () => {
      expect(consumerAppFromWardRecord.code).toBe(wardCode);
    });
    it('Has the patient movements within the ward', () => {
      expect(consumerAppFromWardRecord.patientMovements.length).toBeGreaterThan(0);
    });
  });
  describe('Consumer App\'s Ward Resource API Endpoint - Ward transferred to', () => {
    it('Has the name set to a mix between the location type and the code', () => {
      expect(consumerAppToWardRecord.name).toBe(`Ward#${newWardCode}`);
    });
    it('Has the location type set to ward', () => {
      expect(consumerAppToWardRecord.type).toBe('ward');
    });
    it('Has the ward code set correctly', () => {
      expect(consumerAppToWardRecord.code).toBe(newWardCode);
    });
    it('Has the patient movements within the ward', () => {
      expect(consumerAppToWardRecord.patientMovements.length).toBeGreaterThan(0);
    });
  });
  describe('Spell object in Patient Resource API Endpoint response', () => {
    it('Has the startDate set to the admissionDate of the patient', () => {
      expect(consumerAppSpellRecord.startDate).toBe(formatDate(admissionDate));
    });
    it('Has no endDate as the spell has not ended', () => {
      expect(consumerAppSpellRecord.endDate).toBe(null);
    });
    it('Has a list of patientMovements for that spell', () => {
      expect(consumerAppSpellRecord.patientMovements).toHaveLength(2);
    });
    it('Has the patientId set to the patient\'s record id', () => {
      expect(consumerAppSpellRecord.patientId).toBe(consumerAppPatientRecord.id);
    });
  });
  describe('PatientMovement object in Patient Resource API Endpoint response - Admission Movement', () => {
    it('Has the movementDate set to the admissionDate of the patient', () => {
      expect(consumerAppAdmitPatientMovementRecord.movementDate).toBe(formatDate(admissionDate));
    });
    it('Has the locationId set to the ward the patient is admitted to', () => {
      expect(consumerAppAdmitPatientMovementRecord.locationId).toBe(consumerAppFromWardRecord.id);
    });
    it('Has the spellId set to the patient\'s spell', () => {
      expect(consumerAppAdmitPatientMovementRecord.spellId).toBe(consumerAppSpellRecord.id);
    });
  });
  describe('PatientMovement object in Patient Resource API Endpoint response - Transfer Movement', () => {
    it('Has the movementDate set to the admissionDate of the patient', () => {
      expect(consumerAppTransferPatientMovementRecord.movementDate).toBe(formatDate(transferDate));
    });
    it('Has the locationId set to the ward the patient is admitted to', () => {
      expect(consumerAppTransferPatientMovementRecord.locationId).toBe(consumerAppToWardRecord.id);
    });
    it('Has the spellId set to the patient\'s spell', () => {
      expect(consumerAppTransferPatientMovementRecord.spellId).toBe(consumerAppSpellRecord.id);
    });
  });
}, 57000);
