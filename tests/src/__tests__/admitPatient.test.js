import {
  eventualQueueMember,
  eventualApiEntry,
  updateConsumerOffset,
  getConsumerAppInboundQueueListener,
  getProducerAppOutboundQueueListener,
  admitPatient,
  findOutboundAdmitMessage,
  findInboundAdmitMessage,
  findInboundTransferMessage,
  formatDate,
  sleep
} from '../common';
import { v4 as uuid4 } from 'uuid';

describe('Integration with Patient Administration System', () => {

  let producerAppOutboundMessages = [];
  let consumerAppInboundMessages = [];
  let producerAppOutboundConsumer;
  let consumerAppInboundConsumer;
  let consumerAppInboundOffset;

  beforeAll(async () => {
    const { consumer, offset } = await getConsumerAppInboundQueueListener();
    consumerAppInboundConsumer = consumer;
    consumerAppInboundOffset = offset;
    producerAppOutboundConsumer = await getProducerAppOutboundQueueListener();

    producerAppOutboundConsumer.on('data', data => {
      console.log('Got message from patient queue');
      producerAppOutboundMessages.push(data.parsed);
    });
    consumerAppInboundConsumer.on('message', (message) => {
      console.log('Got message from patientAdministration queue');
      consumerAppInboundMessages.push(JSON.parse(message.value));
    });

    await sleep(5);
  }, 6000);

  afterAll(() => {
    consumerAppInboundConsumer.close();
    producerAppOutboundConsumer.close();
  });

  describe('Admitting a patient', () => {
    let producerAppAdmitMessage;
    let adapterAppAdmitMessage;
    let adapterAppTransferMessage;
    let consumerAppPatientRecord;
    const nhsNumber = uuid4();
    const wardCode = '666';
    let admissionDate;
    const patientName = 'Admit Test';

    beforeAll(async () => {
      consumerAppInboundMessages = [];
      producerAppOutboundMessages = [];
      await updateConsumerOffset(consumerAppInboundConsumer, consumerAppInboundOffset);
      admissionDate = new Date();
      await admitPatient(nhsNumber, wardCode, patientName);
      producerAppAdmitMessage = await eventualQueueMember(
        producerAppOutboundMessages,
        nhsNumber,
        findOutboundAdmitMessage,
        60
      );
      adapterAppAdmitMessage = await eventualQueueMember(
        consumerAppInboundMessages,
        nhsNumber,
        findInboundAdmitMessage,
        60
      );
      adapterAppTransferMessage = await eventualQueueMember(
        consumerAppInboundMessages,
        nhsNumber,
        findInboundTransferMessage,
        60
      );
    }, 180000);
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
  }, 180000);
}, 180000);
