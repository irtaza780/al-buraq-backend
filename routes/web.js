const express = require("express");
const router = express.Router();

const userController = require("../app/controllers/user");
const ordersController = require("../app/controllers/ordersController");
const servicesController = require("../app/controllers/servicesController");
const common = require("../app/controllers/commonFunctions");
const adminController = require("../app/controllers/adminController");
var { ordersFileMiddleware } = require("../app/uploadCards/uploadFile");

const user = "/user";
const admin = "/admin";

// upload image
// const uploadMiddleware = router.post(
//   "/upload/file",
//   uploadImage.single("file"),
//   async (req, res) => {
//     try {
//       if (!req.fileValidationError) {
//         console.log("image", req?.file?.filename);
//         let fileUrl = req?.file?.filename;
//         res.status(200).send({ img_url: fileUrl });
//       } else {
//         console.log("error");
//       }
//     } catch (err) {
//       console.log("error", err);
//       res
//         .status(503)
//         .send({ success: false, message: "Internal Server Error." });
//     }
//   }
// );

//*****************user routes*******************
router.post(`${user}/email/register`, userController.registerEmail);
router.post(`${user}/verify/code`, userController.verifyOtpCode);
router.post(`${user}/register`, userController.registerUser);
router.post(`${user}/login`, userController.userLogin);

router.use(`${user}/profile`, common.verifyToken);
router.put(`${user}/profile`, userController.updateProfile);

// reset password request/forget password
router.post(`${user}/resetpassword`, userController.resetPassword);
// update password/ after forget password
router.put(`${user}/password`, userController.updatePassword);
// resend code if not sent
router.post(`${user}/resendcode`, userController.resendCode);

// update new password after user is logged in.
router.use(`${user}/new/password`, common.verifyToken);
router.post(`${user}/new/password`, userController.newPassword);

//verify access token expiration
router.get("/check/expiration", common.verifyExpiration);

//*****************admin routes*******************

//services
router.post(`${admin}/create/service`, adminController.createService);
router.get(`${admin}/get/service/:id`, adminController.getServices);
router.patch(
  `${admin}/update/service/:serviceId`,
  adminController.updateService
);
router.delete(`${admin}/delete/service/:id`, adminController.deleteService);

//orders
router.get(`${admin}/get/orders`, adminController.getOrders);
router.patch(`${admin}/approve/order/:orderId`, adminController.approveOrder);
router.patch(`${admin}/reject/order/:orderId`, adminController.rejectOrder);
router.get(
  `${admin}/download/orderfile/:fileName`,
  ordersController.downloadOrderFile
);

//*****************user routes ********************/

//orders
router.post(
  `${user}/create/order/:userId`,
  // common.verifyToken,
  ordersFileMiddleware,
  ordersController.createOrder
);
router.get(
  `${user}/get/orders/:userId`,
  // common.verifyToken,
  ordersController.getUserOrders
);
router.get(`${user}/order/get/venmo-token`, ordersController.getVenmoToken);
router.post(`${user}/order/pay/venmo`, ordersController.payThroughVenmo);

router.patch(
  `${user}/cancel/order`,
  // common.verifyToken,
  ordersController.cancelOrder
);

//services
router.get(
  `${user}/get/services/:id`,
  // common.verifyToken,
  servicesController.getServices
);

//invalid route
router.delete("*", (req, res) => {
  res.send("route does not match any.");
});
module.exports = router;
