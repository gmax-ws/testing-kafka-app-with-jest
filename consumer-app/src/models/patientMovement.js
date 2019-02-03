const PatientMovement = (orm, dataTypes) => {
  const PatientMovementModel = orm.define('patientMovement', {
    movementDate: {
      type: dataTypes.DATE,
      field: 'movement_date',
      allowNull: false
    }
  },
  {
    freezeTableName: true
  });

  PatientMovementModel.associate = (models) => {
    PatientMovementModel.belongsTo(models.spell);
    PatientMovementModel.belongsTo(models.location);
  };

  return PatientMovementModel;
};

export default PatientMovement;
