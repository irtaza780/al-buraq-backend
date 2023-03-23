const db = require("../models");

exports.getServices = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === "all") {
      let services = await db.services.findAll({});
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
