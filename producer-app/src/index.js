const restify = require('restify');

function admit(req, res, next) {
  const {
    name,
    // nhsNumber,
    admittingWard,
    admissionDate
  } = req.body;
  console.log(`admitting ${name} to ${admittingWard} on ${admissionDate}`);
  res.send(201);
  next();
}

function discharge(req, res, next) {
  const {
    nhsNumber,
    dischargeDate
  } = req.body;
  console.log(`Discharging ${nhsNumber} on ${dischargeDate}`);
  res.send(200);
  next();
}

function transfer(req, res, next) {
  const {
    nhsNumber,
    fromWard,
    toWard,
    transferDate
  } = req.body;
  console.log(`Transferring ${nhsNumber} from ${fromWard} to ${toWard} on ${transferDate}`);
  res.send(200);
  next();
}


const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.post('/admit', admit);
server.post('/discharge', discharge);
server.post('/transfer', transfer);


server.listen(8080, () => {
  console.log('%s listening at %s', server.name, server.url);
});
