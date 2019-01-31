import KafkaAvroConsumer from './kafkaAvroConsumer';
import { inboundTopic } from './config';

new KafkaAvroConsumer().then((inboundConsumer) => {
  inboundConsumer.consumer.subscribe([inboundTopic]);
  inboundConsumer.consumer.consume();
  inboundConsumer.consumer.on('data', data => {
    const messageData = data.parsed;
    console.log(messageData);
  });
});
