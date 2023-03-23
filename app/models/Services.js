// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = require('../../config/database');
module.exports = (sequelize, Sequelize) => {
  const services = sequelize.define("services", {
    serviceName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    serviceDescription: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    price: {
      type: Sequelize.DOUBLE,
      allowNull: true,
    },
    pricingType: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  });
  return services;
};
