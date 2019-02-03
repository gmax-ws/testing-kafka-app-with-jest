import {
  wardLocation,
  testPatient,
  testPatientAdmission,
  testPatientSpell
} from '../../testData';

const locationModelMock = {
  findOne: jest.fn().mockResolvedValue(wardLocation),
  findAll: jest.fn().mockResolvedValue([wardLocation]),
  findOrCreate: jest.fn().mockResolvedValue([{ dataValues: wardLocation }]),
  create: jest.fn().mockResolvedValue(wardLocation)
};

const patientModelMock = {
  findOne: jest.fn().mockResolvedValue(testPatient),
  findAll: jest.fn().mockResolvedValue([testPatient]),
  findOrCreate: jest.fn().mockResolvedValue([{ dataValues: testPatient }]),
  create: jest.fn().mockResolvedValue(testPatient)
};

const spellModelMock = {
  findOne: jest.fn().mockResolvedValue(testPatientSpell),
  findAll: jest.fn().mockResolvedValue([testPatientSpell]),
  findOrCreate: jest.fn().mockResolvedValue([{ dataValues: testPatientSpell }]),
  create: jest.fn().mockResolvedValue(testPatientSpell)
};

const patientMovementModelMock = {
  findOne: jest.fn().mockResolvedValue(testPatientAdmission),
  findAll: jest.fn().mockResolvedValue([testPatientAdmission]),
  findOrCreate: jest.fn().mockResolvedValue([{ dataValues: testPatientAdmission }]),
  create: jest.fn().mockResolvedValue(testPatientAdmission)
};

const db = {
  patient: patientModelMock,
  patientMovement: patientMovementModelMock,
  spell: spellModelMock,
  location: locationModelMock,
  sequelize: jest.fn(),
  Sequelize: jest.fn()
};

export default db;
