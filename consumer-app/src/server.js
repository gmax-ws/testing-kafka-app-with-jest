/** @module server */
import db from './models';

/**
 * List the wards in the system
 *
 * @param {Object} req - HTTP Request object
 * @param {Object} res - HTTP Response object
 * @param {function} next - Function to call next
 * @returns {Promise<void>}
 */
export const listWards = async (req, res, next) => {
  const wards = await db.location.findAll();
  res.send(200, wards);
  next();
};

/**
 * Get the ward with the specified ID
 *
 * @param {Object} req - HTTP Request object
 * @param {Object} res - HTTP Response object
 * @param {function} next - Function to call next
 * @returns {Promise<void>}
 */
export const getWard = async (req, res, next) => {
  const ward = await db.location.findOne(
    {
      where: { code: req.params.wardCode, type: 'ward' },
      include: [
        {
          model: db.patientMovement
        }
      ]
    }
  );
  res.send(200, ward);
  next();
};

/**
 * List the patients in the system
 *
 * @param {Object} req - HTTP Request object
 * @param {Object} res - HTTP Response object
 * @param {function} next - Function to call next
 * @returns {Promise<void>}
 */
export const listPatients = async (req, res, next) => {
  const patients = await db.patient.findAll();
  res.send(200, patients);
  next();
};

/**
 * Get the patient with the specified ID
 *
 * @param {Object} req - HTTP Request object
 * @param {Object} res - HTTP Response object
 * @param {function} next - Function to call next
 * @returns {Promise<void>}
 */
export const getPatient = async (req, res, next) => {
  const patient = await db.patient.findOne({
    where: { nhsNumber: req.params.nhsNumber },
    include: [
      { all: true, nested: true },
      {
        model: db.spell,
        where: { endDate: null },
        required: false,
        include: [
          {
            model: db.patientMovement
          }
        ]
      }
    ],
    order: [
      [db.spell, db.patientMovement, 'id', 'DESC']
    ]
  });
  res.send(200, patient);
  next();
};
