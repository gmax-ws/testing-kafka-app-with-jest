export const wardLocation = {
  name: 'Ward#666',
  code: '666',
  type: 'ward',
  id: 1
};

export const testPatient = {
  name: 'Colin Wren',
  nhsNumber: '666',
  id: 1
};

export const testPatientSpell = {
  patientId: 1,
  startDate: '1988-01-12T06:00:00.000Z',
  id: 1
};

export const testPatientAdmission = {
  spellId: 1,
  locationId: 1,
  movementDate: '1988-01-12T06:00:00.000Z'
};

export const admitMessage = {
  type: 'admit',
  nhsNumber: '666',
  data: {
    name: 'Colin Wren',
    nhsNumber: '666',
    admittingWard: '666',
    admissionDate: '1988-01-12T06:00:00.000Z'
  }
};
