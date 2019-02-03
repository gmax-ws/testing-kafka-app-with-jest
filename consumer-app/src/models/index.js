import Sequelize from 'sequelize';
import { readdirSync } from 'fs';
import { join, basename as getBaseName } from 'path';
const basename = getBaseName(__filename);
const db = {};

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  retry: 20,

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },

  // SQLite only
  storage: join(__dirname, '../../../app.sqlite')
});

readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    const model = sequelize.import(join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
