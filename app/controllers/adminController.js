const { services } = require("../models");
const db = require("../models");

exports.createService = async (req, res) => {
  console.log("reaching here");
  try {
    const { serviceName, serviceDescription, price, pricingType } = req.body;
    let service = await db.services.create({
      serviceName,
      serviceDescription,
      price,
      pricingType,
    });
    console.log(service);

    if (service) {
      res.status(200).send({
        success: true,
        message: "Service Create Successfully",
        service,
      });
    } else {
      res.status(401).send({
        success: false,
        message: "Unable to create Service",
        error: service,
      });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ success: false, message: "Internal Server Error", err });
  }
};

exports.getServices = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === "all") {
      let services = await db.services.findAll();
      if (services) {
        res.status(200).send({ success: true, data: services });
      } else {
        res.status(404).send({
          success: false,
          message: "No Service Found",
          error: services,
        });
      }
    } else {
      let service = await db.services.findOne({
        where: {
          id,
        },
      });
      if (service) {
        res.status(200).send({ success: true, data: service });
      } else {
        res.status(404).send({
          success: false,
          message: "No Service Found",
          error: service,
        });
      }
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ success: false, message: "Internal Server Error", err });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    let deleteService = await db.services.destroy({
      where: {
        id,
      },
    });
    if (deleteService) {
      res
        .status(200)
        .send({ success: true, message: "Record Deleted Successfully" });
    } else {
      res
        .status(401)
        .send({ success: false, message: "Unable to delete record" });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ success: false, message: "Internal Server error", err });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { serviceName, serviceDescription, price, pricingType } = req.body;
    const service = await db.services.findOne({
      where: {
        id: serviceId,
      },
    });
    if (serviceName && price) {
      if (service) {
        await db.services.update(
          {
            serviceName,
            serviceDescription,
            price,
            pricingType,
          },
          { where: { id: service.id } }
        );
        res.status(200).send({ success: true, message: "Service Updated" });
      } else {
        res.status(404).send({ success: false, message: "Service Not Found" });
      }
    } else {
      res
        .status(401)
        .send({ success: false, message: "Please send Correct data" });
    }
  } catch (err) {}
};

//orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await db.orders.findAll({
      raw: true,
      include: [
        {
          model: db.users,
          attributes: ["id", "firstName", "lastName", "isVerified"],
        },
        {
          model: db.services,
        },
      ],
    });
    res.status(200).send({ success: true, data: orders });
  } catch (err) {
    console.log(err);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

exports.approveOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await db.orders.findOne({
      where: {
        id: orderId,
      },
    });
    if (order) {
      await db.orders.update(
        { approvalStatus: true },
        { where: { id: order.id } }
      );
      res.status(200).send({ success: true, message: "Order Approved" });
    } else {
      res.status(404).send({ success: false, message: "Order Not Found" });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ success: false, message: "Internal Server Error ", err });
  }
};

exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await db.orders.findOne({
      where: {
        id: orderId,
      },
    });
    if (order) {
      await db.orders.update(
        { approvalStatus: false },
        { where: { id: order.id } }
      );
      res.status(200).send({ success: true, message: "Order Rejected" });
    } else {
      res.status(404).send({ success: false, message: "Order Not Found" });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ success: false, message: "Internal Server Error ", err });
  }
};
