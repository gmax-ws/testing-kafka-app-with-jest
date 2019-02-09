import async from 'async';
import restify from 'restify';
import KafkaConsumer from './kafkaConsumer';
import {
  listWards,
  getWard,
  listPatients,
  getPatient
} from './server';
import db from './models';
import { processMessage } from './messageProcessing';

// set up the Server
const apiServer = restify.createServer();
apiServer.get('/wards', listWards);
apiServer.get('/wards/:wardCode', getWard);
apiServer.get('/patients', listPatients);
apiServer.get('/patients/:nhsNumber', getPatient);


const consumer = new KafkaConsumer();

db.sequelize.sync().then(() => {
  const queue = async.queue((task, callback) => {
    console.log(`Working on message from queue: ${JSON.stringify(task)}`);
    processMessage(task)
      .then(() => callback())
      .catch((err) => {
        console.log(`Error processing message ${err.message}`);
        callback();
      });
  });

  consumer.consumer.on('message', (rawMessage) => {
    const message = JSON.parse(rawMessage.value);
    console.log(`Adding message to queue: ${JSON.stringify(rawMessage)}`);
    queue.push(message);
  });

  apiServer.listen(8080, () => {
    console.log('Server set up');
  });
});
