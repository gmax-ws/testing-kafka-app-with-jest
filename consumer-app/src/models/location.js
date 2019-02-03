const Location = (orm, dataTypes) => {
  const LocationModel = orm.define('location', {
    name: {
      type: dataTypes.STRING,
      allowNull: false
    },
    type: {
      type: dataTypes.ENUM('hospital', 'wing', 'ward', 'bay', 'bed'),
      allowNull: false
    },
    code: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    freezeTableName: true
  });

  LocationModel.associate = (models) => {
    LocationModel.hasMany(models.patientMovement);
  };

  return LocationModel;
};

export default Location;
