/** @module messageProcessing */
import db from './models';

/**
 * Process the admit message from the Kafka queue and create patient and spell if they don't exist.
 *
 * @param {Object} message - Admit message
 * @returns {Promise<void>}
 */
export const admitPatient = async (message) => {
  try {
    const patients = await db.patient.findOrCreate({
      where: { nhsNumber: message.nhsNumber },
      defaults: { name: message.data.name }
    });
    console.log(`Created Patient #${patients[0].dataValues.id}`);
    const spells = await db.spell.findOrCreate({
      where: {
        endDate: null,
        patientId: patients[0].dataValues.id
      },
      defaults: {
        startDate: message.data.admissionDate
      }
    });
    console.log(`Created Spell #${spells[0].dataValues.id} for Patient #${patients[0].dataValues.id}`);
  } catch (err) {
    console.log(`Error admitting Patient: ${err.message}`);
  }
};

/**
 * Process the discharge message from the Kafka queue and set the endDate on the patient's spell
 *
 * @param {Object} message - Discharge message
 * @returns {Promise<void>}
 */
export const dischargePatient = async (message) => {
  try {
    const patient = await db.patient.findOne({
      where: { nhsNumber: message.nhsNumber }
    });
    console.log(`Found Patient #${patient.dataValues.id}`);
    const spell = await db.spell.findOne({
      where: {
        endDate: null,
        patientId: patient.dataValues.id
      }
    });
    console.log(`Found Spell #${spell.dataValues.id} for Patient #${patient.dataValues.id}`);
    spell.endDate = message.data.dischargeDate;
    await spell.save();
    console.log(`Updated endDate for Spell #${spell.dataValues.id}`);
  } catch (err) {
    console.log(`Error discharging Patient: ${err.message}`);
  }
};

/**
 * Process the transfer message from the Kafka queue and create a new patient movement
 * for the patient's spell
 *
 * @param {Object} message - Transfer message
 * @returns {Promise<void>}
 */
export const transferPatient = async (message) => {
  try {
    if (message.data.fromWard !== null) {
      const fromLocations = await db.location.findOrCreate({
        where: { code: message.data.fromWard },
        defaults: {
          type: 'ward',
          name: `Ward#${message.data.fromWard}`
        }
      });
      console.log(`Freeing up bed in Ward#${fromLocations[0].dataValues.code}`);
    }
    if (message.data.toWard !== null) {
      const toLocations = await db.location.findOrCreate({
        where: { code: message.data.toWard },
        defaults: {
          type: 'ward',
          name: `Ward#${message.data.toWard}`
        }
      });
      console.log(`Found Ward#${toLocations[0].dataValues.code} to transfer patient to`);
      const patient = await db.patient.findOne({
        where: { nhsNumber: message.nhsNumber }
      });
      console.log(`Found record Patient#${patient.dataValues.id}`);
      const spell = await db.spell.findOne({
        where: {
          endDate: null,
          patientId: patient.dataValues.id
        }
      });
      console.log(`Found spell#${spell.dataValues.id} for Patient#${patient.dataValues.id}`);
      const transfer = await db.patientMovement.create({
        spellId: spell.dataValues.id,
        locationId: toLocations[0].dataValues.id,
        movementDate: message.data.transferDate
      });
      console.log(`Created patientMovement#${transfer.dataValues.id}`);
    }
  } catch (err) {
    console.log(`Error transferring Patient: ${err.message}`);
  }
};

/**
 * Process message from queue
 *
 * @param {Object} message - Kafka Message
 * @returns {Promise<void>}
 */
export const processMessage = async (message) => {
  if (message.type === 'admit') {
    console.log('About to admit patient');
    await admitPatient(message);
  }
  if (message.type === 'discharge') {
    console.log('About to discharge patient');
    await dischargePatient(message);
  }
  if (message.type === 'transfer') {
    console.log('About to transfer patient');
    await transferPatient(message);
  }
};
