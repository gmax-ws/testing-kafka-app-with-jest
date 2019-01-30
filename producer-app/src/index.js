import restify from 'restify';
import { admit, discharge, transfer } from './server';
import { sendAdmitMessage, sendDischargeMessage, sendTransferMessage } from './messaging';
import KafkaProducer from './kafkaProducer';


// Set up the API Server
const apiServer = restify.createServer();
apiServer.use(restify.plugins.bodyParser());
apiServer.pre(restify.plugins.pre.context());

// Set up the Kafka Producer
new KafkaProducer().then((producer) => {
  apiServer.post('/admit', admit, (req, res, next) => sendAdmitMessage(req, res, next, producer));
  apiServer.post('/discharge', discharge, (req, res, next) => sendDischargeMessage(req, res, next, producer));
  apiServer.post('/transfer', transfer, (req, res, next) => sendTransferMessage(req, res, next, producer));


  apiServer.listen(8080, () => {
    console.log('%s listening at %s', apiServer.name, apiServer.url);
  });
});
