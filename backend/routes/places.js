const express = require("express");
const { check } = require("express-validator");

const placesController = require("../controllers/places");
const fileMiddleware = require("../middleware/image-uplaod");
const authCheck = require("../middleware/auth-checker");

const router = express.Router();

router.get("/:pid", placesController.getPlaceById);

router.get("/user/:uid", placesController.getPlaceByUserId);

router.use(authCheck);

router.post(
  "/",
  fileMiddleware.single("image"),
  [
    check("title", "Title cant be empty").notEmpty(),
    check("description", "Description must be atleast 3 letters").isLength({ min: 3 }),
    check("address", "Address cant be empty").notEmpty(),
  ],
  placesController.createPlace
);

router.patch(
  "/:pid",
  [
    check("title", "Title cant be empty").notEmpty(),
    check("description", "Description must be atleast 3 letters").isLength({ min: 3 }),
  ],
  placesController.updatePlaceById
);

router.delete("/:pid", placesController.deletePlaceById);

module.exports = router;
