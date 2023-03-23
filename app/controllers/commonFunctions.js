const jwt = require("jsonwebtoken");
const db = require("../models");
const nodemailer = require("nodemailer");
// verifyToken
exports.verifyToken = (req, res, next) => {
  let token = req.headers["token"];
  try {
    if (token) {
      const verified = jwt.verify(token, process.env.JWT_TOKEN_KEY);
      if (verified) {
        console.log(verified, verified?.role, verified?.id);
        req.right = verified?.role;
        req.user_id = verified?.id;
        next();
      } else {
        return res.status(401).send("access denied");
      }
    } else {
      res.status(401).send("you are not allowed to perform this action");
    }
  } catch (err) {
    console.log("catch error", err);
    res.status(401).send("token expired");
  }
};

// verifyToken
exports.verifyExpiration = (req, res, next) => {
  let token = req.headers["token"];
  try {
    if (token) {
      const verified = jwt.verify(token, process.env.JWT_TOKEN_KEY);
      if (verified) {
        console.log(verified, verified?.role, verified?.id);
        req.right = verified?.role;
        req.user_id = verified?.id;
        res.status(200).send({ success: true, message: "valid" });
        // next()
      } else {
        return res.status(401).send("access denied");
      }
    } else {
      res.status(401).send({
        success: false,
        message: "you are not allowed to perform this action",
      });
    }
  } catch (err) {
    console.log("catch error", err);
    res.status(401).send({ success: false, message: "token expired" });
  }
};

exports.contactUs = async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    console.log("sending email");
    var response;
    let transporter = nodemailer.createTransport({
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      service: "gmail",
    });

    let mailOptions = {
      from: email,
      to: "irtaza780@gmail.com",
      subject: subject,
      html: message,
    };
    await transporter
      .sendMail(mailOptions)
      .then((data) => {
        res.status(200).send({ success: true, data: data });
      })
      .catch((err) => {
        console.log("err ", err);
        res.status(401).send({ success: false, data: err });
      });
    return response;
  } catch (err) {
    console.log(err);
  }
};
