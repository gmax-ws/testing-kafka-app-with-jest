import KafkaConsumer from './kafkaConsumer';
import restify from 'restify';
import { listWards, listPatients } from './server';
import db from './models';

// set up the Server
const apiServer = restify.createServer();
apiServer.get('/wards', listWards);
// apiServer.get('/wards/:id', getWard);
apiServer.get('/patients', listPatients);
// apiServer.get('/patients/:id', getPatient);


const consumer = new KafkaConsumer();

db.sequelize.sync().then(() => {

  consumer.consumer.on('message', (rawMessage) => {
    const message = JSON.parse(rawMessage.value);
    console.log(`Looking up patient with NHS Number of ${message.nhsNumber}`);
    if (message.type === 'admit') {
      console.log(`Didn't find record so creating new patient: ${message.data.name}`);
      db.patient.findOrCreate({
        where: { nhsNumber: message.nhsNumber },
        defaults: { name: message.data.name }
      }).then((patients) => {
        db.spell.findOrCreate({
          where: {
            endDate: null,
            patientId: patients[0].dataValues.id
          },
          defaults: {
            startDate: message.data.admissionDate
          }
        }).catch((err) => console.log(`Error creating Spell: ${err.message}`));
      }).catch((err) => console.log(`Error creating Patient: ${err.message}`));
    }
    if (message.type === 'discharge') {
      console.log(`Discharging Patient with NHS Number of ${message.nhsNumber}`);
      db.patient.findOne({
        where: { nhsNumber: message.nhsNumber }
      }).then((patient) => {
        if (patient === null) {
          throw new Error('Patient not found');
        }
        db.spell.findOne({
          where: {
            endDate: null,
            patientId: patient.dataValues.id
          }
        }).then((spell) => {
          if (spell === null) {
            throw new Error('Spell not found');
          }
          spell.endDate = message.data.dischargeDate;
          spell.save().catch((err) => console.log(`Error saving updated spell: ${err.message}`));
        }).catch((err) => console.log(`Error finding active spell: ${err.message}`));
      }).catch((err) => console.log(`Error discharging patient ${err.message}`));
    }
    if (message.type === 'transfer') {
      if (message.data.fromWard !== null) {
        db.location.findOrCreate({
          where: { code: message.data.fromWard },
          defaults: {
            type: 'ward',
            name: `Ward#${message.data.fromWard}`
          }
        });
        console.log(`Freeing up bed in Ward#${message.data.fromWard}`);
      }
      if (message.data.toWard !== null) {
        console.log('toWard detected so creating ward');
        db.location.findOrCreate({
          where: { code: message.data.toWard },
          defaults: {
            type: 'ward',
            name: `Ward#${message.data.toWard}`
          }
        }).then((wards) => {
          console.log('ward created now finding patient to put into ward');
          db.patient.findOne({
            where: { nhsNumber: message.nhsNumber }
          }).then((patient) => {
            if (patient === null) {
              throw new Error('Patient not found');
            }
            console.log('patient found, now getting spell for patient');
            db.spell.findOne({
              where: {
                endDate: null,
                patientId: patient.dataValues.id
              }
            }).then((spell) => {
              if (spell === null) {
                throw new Error('Spell not found');
              }
              console.log('Spell found now creating patient movement');
              db.patientMovement.create({
                spellId: spell.dataValues.id,
                locationId: wards[0].dataValues.id,
                movementDate: message.data.transferDate
              }).then((patientMovement) => {
                console.log('Created patient movement');
              })
                .catch((err) => console.log(`Error creating patientMovement record: ${err.message}`));
            })
              .catch((err) => console.log(`Error finding Patient's active spell: ${err.message}`));
          })
            .catch((err) => console.log(`Error finding patient to transfer: ${err.message}`));
        })
          .catch((err) => console.log(`Error creating ward: ${err.message}`));
      }
      console.log(`Updating patient location to ${message.data.toWard}`);
    }
  });

  apiServer.listen(8082, () => {
    console.log('Server set up');
  });
});