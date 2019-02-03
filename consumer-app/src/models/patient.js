const Patient = (orm, dataTypes) => {
  const PatientModel = orm.define('patient', {
    name: {
      type: dataTypes.STRING,
      allowNull: false
    },
    nhsNumber: {
      type: dataTypes.STRING,
      field: 'nhs_number',
      allowNull: false,
      unique: true
    }
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  PatientModel.associate = (models) => {
    PatientModel.hasMany(models.spell);
  };
  return PatientModel;
};

export default Patient;
