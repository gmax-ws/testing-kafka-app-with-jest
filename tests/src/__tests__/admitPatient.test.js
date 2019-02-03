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
  formatDate
} from '../common';
import { v4 as uuid4 } from 'uuid';
import { config } from '../config';

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

    consumerAppInboundConsumer.on('message', (message) => {
      consumerAppInboundMessages.push(JSON.parse(message.value));
    });

    producerAppOutboundConsumer.subscribe([config.producerApp.outboundQueue.topic]);
    producerAppOutboundConsumer.consume();
    producerAppOutboundConsumer.on('data', (data) => {
      producerAppOutboundMessages.push(data.parsed);
    });
  });

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
    const admissionDate = new Date();
    const patientName = 'Admit Test';

    beforeAll(async () => {
      consumerAppInboundMessages = [];
      producerAppOutboundMessages = [];
      await updateConsumerOffset(consumerAppInboundConsumer, consumerAppInboundOffset);

      await admitPatient(nhsNumber, wardCode, patientName);
      // producerAppAdmitMessage = await eventualQueueMember(
      //   producerAppOutboundMessages,
      //   nhsNumber,
      //   findOutboundAdmitMessage,
      //   50
      // );
      adapterAppAdmitMessage = await eventualQueueMember(
        consumerAppInboundMessages,
        nhsNumber,
        findInboundAdmitMessage,
        10
      );
      adapterAppTransferMessage = await eventualQueueMember(
        consumerAppInboundMessages,
        nhsNumber,
        findInboundTransferMessage,
        10
      );
    }, 30000);
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
  }, 30000);
}, 30000);
