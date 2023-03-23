var multer = require("multer");
const path = require("path");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src");
  },
  filename: (req, file, cb) => {
    var originalname = file.originalname;
    originalname = originalname.replace(/\s/g, "");
    cb(null, Date.now() + "-" + originalname);
  },
});
const ordersFileMiddleware = multer({
  storage: storage,
  limits: { fieldSize: 50 * 1024 * 1024 },
}).fields([{ name: "ordersFile" }]);

module.exports = {
  ordersFileMiddleware,
};
