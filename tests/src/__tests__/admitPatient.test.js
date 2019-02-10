/*
 * @jest-environment ./src/kafkaTestEnvironment.js
 */

import {
  eventualQueueMember,
  eventualApiEntry,
  admitPatient,
  findOutboundAdmitMessage,
  findInboundAdmitMessage,
  findInboundTransferMessage,
  formatDate
} from '../common';
import { v4 as uuid4 } from 'uuid';
import { config } from '../config';

describe('Admitting a patient', () => {
  let producerAppAdmitMessage;
  let adapterAppAdmitMessage;
  let adapterAppTransferMessage;
  let consumerAppPatientRecord;
  let consumerAppWardRecord;
  let consumerAppSpellRecord;
  let consumerAppPatientMovementRecord;
  let consumerAppPatientList;
  let consumerAppWardList;
  const nhsNumber = uuid4();
  const wardCode = '666';
  const admissionDate = new Date(1988, 0, 12, 6, 0, 0);
  const patientName = 'Admit Test';

  beforeAll(async () => {
    consumerAppInboundMessages = [];
    producerAppOutboundMessages = [];
    await admitPatient(nhsNumber, wardCode, patientName, admissionDate);
    producerAppAdmitMessage = await eventualQueueMember(
      producerAppOutboundMessages,
      nhsNumber,
      findOutboundAdmitMessage,
      5
    );
    adapterAppAdmitMessage = await eventualQueueMember(
      consumerAppInboundMessages,
      nhsNumber,
      findInboundAdmitMessage,
      5
    );
    adapterAppTransferMessage = await eventualQueueMember(
      consumerAppInboundMessages,
      nhsNumber,
      findInboundTransferMessage,
      5
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
    consumerAppSpellRecord = consumerAppPatientRecord.spells[0];
    consumerAppPatientMovementRecord = consumerAppSpellRecord.patientMovements[0];
  }, 35000);
  describe('Producer App\'s com.colinwren.Admit Message', () => {
    it('Has the Admit body attribute', () => {
      expect(Object.hasOwnProperty.call(producerAppAdmitMessage.body, 'com.colinwren.Admit')).toBe(true);
    });
    it('Has the patient\'s NHS Number set correctly', () => {
      expect(producerAppAdmitMessage.body['com.colinwren.Admit'].nhsNumber).toBe(nhsNumber);
    });
    it('Has the patient\'s Name', () => {
      expect(producerAppAdmitMessage.body['com.colinwren.Admit'].name).toBe(patientName);
    });
    it('Has the admitting ward', () => {
      expect(producerAppAdmitMessage.body['com.colinwren.Admit'].admittingWard).toBe(wardCode);
    });
    it('Has the correct admissionDate', () => {
      expect(producerAppAdmitMessage.body['com.colinwren.Admit'].admissionDate).toBe(formatDate(admissionDate));
    });
  });
  describe('Adapter App\'s Admit Message', () => {
    it('Has the admit type', () => {
      expect(adapterAppAdmitMessage.type).toBe('admit');
    });
    it('Has the patient\'s NHS Number set correctly', () => {
      expect(adapterAppAdmitMessage.nhsNumber).toBe(nhsNumber);
      expect(adapterAppAdmitMessage.data.nhsNumber).toBe(nhsNumber);
    });
    it('Has the correct Patient Name', () => {
      expect(adapterAppAdmitMessage.data.name).toBe(patientName);
    });
    it('Has the correct ward code', () => {
      expect(adapterAppAdmitMessage.data.admittingWard).toBe(wardCode);
    });
    it('Has the correct admissionDate', () => {
      expect(adapterAppAdmitMessage.data.admissionDate).toBe(formatDate(admissionDate));
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
      expect(adapterAppTransferMessage.data.toWard).toBe(wardCode);
    });
    it('Has the correct fromWard code', () => {
      expect(adapterAppTransferMessage.data.fromWard).toBe(null);
    });
    it('Has the correct transfer date', () => {
      expect(adapterAppTransferMessage.data.transferDate).toBe(formatDate(admissionDate));
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
  describe('Spell object in Patient Resource API Endpoint response', () => {
    it('Has the startDate set to the admissionDate of the patient', () => {
      expect(consumerAppSpellRecord.startDate).toBe(formatDate(admissionDate));
    });
    it('Has no endDate as the spell has not ended', () => {
      expect(consumerAppSpellRecord.endDate).toBe(null);
    });
    it('Has a list of patientMovements for that spell', () => {
      expect(consumerAppSpellRecord.patientMovements).toHaveLength(1);
    });
    it('Has the patientId set to the patient\'s record id', () => {
      expect(consumerAppSpellRecord.patientId).toBe(consumerAppPatientRecord.id);
    });
  });
  describe('PatientMovement object in Patient Resource API Endpoint response', () => {
    it('Has the movementDate set to the admissionDate of the patient', () => {
      expect(consumerAppPatientMovementRecord.movementDate).toBe(formatDate(admissionDate));
    });
    it('Has the locationId set to the ward the patient is admitted to', () => {
      expect(consumerAppPatientMovementRecord.locationId).toBe(consumerAppWardRecord.id);
    });
    it('Has the spellId set to the patient\'s spell', () => {
      expect(consumerAppPatientMovementRecord.spellId).toBe(consumerAppSpellRecord.id);
    });
  });
  describe('Consumer App\'s Patient List API Endpoint', () => {
    it('Contains the admitted patient', () => {
      const patientIds = consumerAppPatientList.map((item) => item.nhsNumber);
      expect(patientIds.includes(nhsNumber)).toBe(true);
    });
  });
  describe('Consumer App\'s Ward List API Endpoint', () => {
    it('Contains the ward the patient is admitted to', () => {
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
}, 35000);
