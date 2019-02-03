
const Spell = (orm, dataTypes) => {
  const SpellModel = orm.define('spell', {
    startDate: {
      type: dataTypes.DATE,
      field: 'start_date',
      allowNull: false
    },
    endDate: {
      type: dataTypes.DATE,
      field: 'end_date'
    }
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  SpellModel.associate = (models) => {
    SpellModel.belongsTo(models.patient);
    SpellModel.hasMany(models.patientMovement);
  };
  return SpellModel;
};

export default Spell;
