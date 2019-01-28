import restify from 'restify';
import { admit, discharge, transfer } from './server';
import { sendAdmitMessage, sendDischargeMessage, sendTransferMessage} from './messaging';
import KafkaProducer from './kafkaProducer';


// Set up the API Server
const apiServer = restify.createServer();
apiServer.use(restify.plugins.bodyParser());
apiServer.pre(restify.plugins.pre.context());

// Set up the Kafka Producer
new KafkaProducer().then((producer) => {
  apiServer.post('/admit', admit, (res, req, next) => sendAdmitMessage(res, req, next, producer));
  apiServer.post('/discharge', discharge, sendDischargeMessage);
  apiServer.post('/transfer', transfer, sendTransferMessage);


  apiServer.listen(8080, () => {
    console.log('%s listening at %s', apiServer.name, apiServer.url);
  });
});
