/** @module messageProcessing */
import db from './models';

/**
 * Format the date into YYYY-MM-DD HH:mm:SS format
 *
 * @param date
 * @returns {string}
 */
const formatDate = (date) => {
  return date.getFullYear() + '-'
    + ('0' + (date.getMonth() + 1)).slice(-2) + '-'
    + ('0' + date.getDate()).slice(-2) + ' '
    + ('0' + date.getHours()).slice(-2) + ':'
    + ('0' + date.getMinutes()).slice(-2) + ':'
    + ('0' + date.getSeconds()).slice(-2) + '.000 +00:00';
};

/**
 * Convert the YYYY-MM-DDTHH:mm:SS.sssZ date to an actual date object
 * @param rawDateString
 * @returns {Date}
 */
const convertDate = (rawDateString) => {
  const rawDate = new Date(rawDateString);
  return formatDate(rawDate);
};

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
        startDate: convertDate(message.data.admissionDate)
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
    spell.endDate = convertDate(message.data.dischargeDate);
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
        movementDate: convertDate(message.data.transferDate)
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
