const { findOne } = require("domutils");
const db = require("../models");
const gateway = require("../middlewares/gateway");

exports.createOrder = async (req, res) => {
  console.log("create order api hit");
  try {
    const { userId } = req.params;
    const { orderDescription, specialRequests, orderAddress, orderType } =
      req.body;
    const ordersFile = req.files["ordersFile"]
      ? req.files["ordersFile"][0].filename
      : null;

    console.log("orders file is ", ordersFile);

    const user = await db.users.findOne({
      where: {
        id: userId,
      },
    });

    if (user) {
      if (orderDescription && orderType) {
        const order = await db.orders.create({
          orderDescription,
          specialRequests,
          orderType,
          orderAddress,
          cancellationStatus: false,
          orderedBy: user.id,
          fileUrl: "/files/" + ordersFile,
          isPaid: false,
        });
        if (order) {
          res.status(200).send({
            success: true,
            message: "Order Created Successfully",
            order,
          });
        } else {
          res
            .status(401)
            .send({ success: false, message: "Cannot Create Order" });
        }
      } else {
        res
          .status(407)
          .send({ success: false, message: "Please send correct data" });
      }
    } else {
      res.status(404).send({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ success: false, message: "Internal Server Error", err });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await db.users.findOne({
      where: {
        id: userId,
      },
    });
    if (user) {
      const orders = await db.orders.findAll({
        where: {
          orderedBy: user.id,
        },
        include: [
          {
            model: db.services,
          },
        ],
      });
      if (orders) {
        res.status(200).send({ success: true, data: orders });
      } else {
        res
          .status(400)
          .send({ success: false, message: "error, no orders found" });
      }
    } else {
      res.status(400).send({ success: false, message: "user not found" });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ success: false, message: "Internal Server Error", err });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await db.orders.findOne({
      where: { id: orderId },
    });
    if (order) {
      await db.orders.update(
        { cancellationStatus: true },
        { where: { id: order.id } }
      );
      res
        .status(200)
        .send({ success: false, message: "Your Order has been cancelled " });
    } else {
      res.status(404).send({ success: false, message: "some error" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ success: true, message: "Internal Server Error" });
  }
};

exports.downloadOrderFile = async (req, res) => {
  try {
    const { fileName } = req.params;
    const file = `src/${fileName}`;
    res.download(file, fileName);
    console.log("here");
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ success: false, message: "Internal Server Error", err });
  }
};

exports.getVenmoToken = (req, res, next) => {
  try {
    gateway.clientToken
      .generate({})
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => res.status(500).send(err));
  } catch (err) {
    res.status(400).send("server error");
  }
};
exports.payThroughVenmo = async (req, res) => {
  try {
    const { userId, orderId, nonce } = req.body;

    const user = await db.users.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User Not Found" });
    }

    const order = await db.orders.findOne({
      where: {
        id: orderId,
      },
    });
    if (!order) {
      return res
        .status(404)
        .send({ success: false, message: "order not found" });
    }
    let params = {
      amount: 10,
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      },
      customer: {
        id: 1,
        firstName: user.firstName,
        lastName: user.lastName,
        company: "xyz company",
        email: user.email,
        website: "google.com",
        phone: "1234568",
      },
      customer: {
        id: 1,
        firstName: user.firstName,
        lastName: user.lastName,
        company: "xyz company",
        email: user.email,
        website: "google.com",
        phone: "1234568",
      },
    };

    gateway.transaction.sale(params).then(async (result) => {
      console.log("payment Object is ", result);
      if (result.success === true) {
        const updatedOrder = await db.orders.update(
          { isPaid: true },
          { where: { id: order.id } }
        );
        res
          .status(200)
          .json({ success: true, message: "Payment Successful", updatedOrder });
      } else if (result.success === false) {
        res
          .status(401)
          .json({ success: false, message: "Payment Unsuccessful" });
      }
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ success: false, message: "Something went wrong", err });
  }
};
