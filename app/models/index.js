const databaseConfig = require("../../config/database");
const Sequelize = require("sequelize");
const { request } = require("http");

const sequelizeInstance = new Sequelize(
  databaseConfig.DB,
  databaseConfig.USER,
  databaseConfig.PASSWORD,
  {
    host: databaseConfig.HOST,
    port: 3306,
    dialect: databaseConfig.dialect,
    operatorsAliases: 0,

    pool: {
      max: databaseConfig.pool.max,
      min: databaseConfig.pool.min,
      acquire: databaseConfig.pool.acquire,
      idle: databaseConfig.pool.idle,
    },
    dialectOptions: {
      multipleStatements: true,
      // ssl: {
      //   rejectUnauthorized: false,
      //   ca: fs.readFileSync(__dirname ,'../../ca-certificate.crt')
      // }
    },
  }
);
const db = {};

db.users = require("./User")(sequelizeInstance, Sequelize);
db.services = require("./Services")(sequelizeInstance, Sequelize);
db.orders = require("./Orders")(sequelizeInstance, Sequelize);

db.users.hasMany(db.orders, { foreignKey: "orderedBy" });
db.orders.belongsTo(db.users, { foreignKey: "orderedBy" });

db.orders.hasOne(db.orders, { foreignKey: "orderType" });
db.orders.belongsTo(db.services, { foreignKey: "orderType" });

db.Sequelize = Sequelize;
db.sequelize = sequelizeInstance;

/****************************************** */
module.exports = db;
