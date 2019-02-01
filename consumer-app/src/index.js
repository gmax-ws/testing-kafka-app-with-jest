import KafkaConsumer from './kafkaConsumer';


const consumer = new KafkaConsumer();
consumer.consumer.on('message', (rawMessage) => {
  const message = JSON.parse(rawMessage.value);
  console.log(`Looking up patient with NHS Number of ${message.nhsNumber}`);
  if (message.type === 'admit') {
    console.log(`Didn't find record so creating new patient: ${message.data.name}`);
  }
  if (message.type === 'discharge') {
    console.log('Discharging Patient');
  }
  if (message.type === 'transfer') {
    if (message.data.fromWard !== null ) {
      console.log(`Freeing up bed in Ward#${message.data.fromWard}`);
    }
    console.log(`Updating patient location to ${message.data.toWard}`);
  }
});
