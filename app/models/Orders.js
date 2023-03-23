module.exports = (sequelize, Sequelize) => {
  const orders = sequelize.define("orders", {
    orderDescription: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    specialRequests: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    approvalStatus: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    },
    cancellationStatus: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    },
    deliveryAddress: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    fileUrl: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isPaid: {
      type: Sequelize.BOOLEAN,
    },
  });
  return orders;
};
