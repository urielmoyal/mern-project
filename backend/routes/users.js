const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users");
const fileMiddleware = require("../middleware/image-uplaod");

const router = express.Router();

router.get("/", usersController.getUsers);

router.post(
  "/login",
  check("email", "Invalid email").normalizeEmail().isEmail(),
  usersController.login
);

router.post(
  "/signup",
  fileMiddleware.single("image"),
  [
    check("name", "name can't be empty").notEmpty(),
    check("email", "Invalid email").normalizeEmail().isEmail(),
    check("password", "Password must contain at least 6 letters").isLength({ min: 6 }),
  ],
  usersController.singup
);

module.exports = router;
