import db from './models';

export const listWards = async (req, res, next) => {
  const wards = await db.location.findAll({
    include: [
      {
        model: db.patientMovement
      }
    ]
  });
  res.send(200, wards);
  next();
};

export const getWard = async (req, res, next) => {
  const ward = await db.location.findOne({ where: { code: req.params.id, type: 'ward' } });
  res.send(200, ward);
  next();
};

export const listPatients = async (req, res, next) => {
  const patients = await db.patient.findAll({
    include: [
      {
        model: db.spell,
        limit: 1,
        where: { endDate: null },
        include: [
          {
            model: db.patientMovement,
            limit: 1,
            order: [
              ['movementDate', 'DESC']
            ]
          }
        ]
      }
    ]
  });
  res.send(200, patients);
  next();
};

export const getPatient = async (req, res, next) => {
  const patient = await db.patient.findOne({ where: { nhsNumber: req.params.id } });
  res.send(200, patient);
  next();
};