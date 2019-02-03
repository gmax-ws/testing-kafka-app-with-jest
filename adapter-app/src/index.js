import KafkaAvroConsumer from './kafkaAvroConsumer';
import KakfaProducer from './kafkaProducer';
import { inboundTopic } from './config';

new KafkaAvroConsumer().then((inboundConsumer) => {
  inboundConsumer.consumer.subscribe([inboundTopic]);
  inboundConsumer.consumer.consume();

  new KakfaProducer().then((producer) => {
    inboundConsumer.consumer.on('data', data => {
      const messageData = data.parsed;
      console.log(messageData);
      if (Object.prototype.hasOwnProperty.call(messageData.body, 'com.colinwren.Admit')) {
        const baseMessage = {
          nhsNumber: messageData.body['com.colinwren.Admit'].nhsNumber
        };
        const admitMessage = Object.assign({}, baseMessage, { type: 'admit', data: messageData.body['com.colinwren.Admit'] });
        const transferMessage = Object.assign({}, baseMessage, { type: 'transfer', data: { fromWard: null, toWard: messageData.body['com.colinwren.Admit'].admittingWard, transferDate: messageData.body['com.colinwren.Admit'].admissionDate } });
        producer.sendMessageToKafka([admitMessage, transferMessage]);
      }
      if (Object.prototype.hasOwnProperty.call(messageData.body, 'com.colinwren.Discharge')) {
        const baseMessage = {
          nhsNumber: messageData.body['com.colinwren.Discharge'].nhsNumber
        };
        const dischargeMessage = Object.assign({}, baseMessage, { type: 'discharge', data: messageData.body['com.colinwren.Discharge'] });
        const transferMessage = Object.assign({}, baseMessage, { type: 'transfer', data: { fromWard: null, toWard: null, transferDate: messageData.body['com.colinwren.Discharge'].dischargeDate } });
        producer.sendMessageToKafka([transferMessage, dischargeMessage]);
      }
      if (Object.prototype.hasOwnProperty.call(messageData.body, 'com.colinwren.Transfer')) {
        const baseMessage = {
          nhsNumber: messageData.body['com.colinwren.Transfer'].nhsNumber
        };
        const transferMessage = Object.assign({}, baseMessage, { type: 'transfer', data: messageData.body['com.colinwren.Transfer'] });
        producer.sendMessageToKafka([transferMessage]);
      }
    });
  });
});
