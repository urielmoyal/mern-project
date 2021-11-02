const { validationResult } = require("express-validator");
const fs = require("fs");

const getCoordsForAddress = require("../util/loction");
const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, address } = req.body;

  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (error) {
    console.log(error);
    return next(new HttpError("field to save place please try again!", 500));
  }

  if (!user) {
    return next(new HttpError("No user found for that id", 500));
  }

  let location;

  try {
    location = await getCoordsForAddress.getCoordsForAddress(address);
  } catch (error) {
    console.log(error);
  }

  const newPlace = new Place({
    title,
    description,
    address,
    image: req.file.path,
    location,
    creator: req.userData.userId,
  });

  try {
    user.places.push(newPlace);
    await user.save();
    await newPlace.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError("field to save place please try again!", 500));
  }

  res.status(201).json({ newPlace });
};

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).exec();
  } catch (err) {
    const error = new HttpError("something went wornd", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError("could not find a place for the provided place id", 404);
    return next(error);
  }
  res.json({ place });
};

const getPlaceByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userPlace;

  try {
    userPlace = await User.findById(userId).populate("places").exec();
  } catch (err) {
    console.log(err);
    return next(new HttpError("something went wornd", 500));
  }

  if (!userPlace) {
    return next(new HttpError("could not find a place for the provided user id", 404));
  }

  res.json(userPlace.places);
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description } = req.body;

  const placeId = req.params.pid;

  let placeObj;

  try {
    placeObj = await Place.findByIdAndUpdate(placeId, {
      title: title,
      description: description,
    }).exec();
  } catch (err) {
    return next(new HttpError("field to update place please try again", 500));
  }
  if (placeObj.creator.toString() !== req.userData.userId) {
    return next(new HttpError("Your'e not allowed to edit this place", 401));
  }

  if (!placeObj) {
    return next(new HttpError("could not find a place for the provided user id", 404));
  }

  res.status(201).json({ message: "Place with the id " + placeId + " updated successfuly" });
};

const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    console.log(error);
    return next(new HttpError("field to delete place please try again", 500));
  }

  if (!place) {
    return next(new HttpError("Could not find a place for this place id", 404));
  }

  if (place.creator.id.toString() !== req.userData.userId) {
    return next(new HttpError("Your'e not allowed to delete this place", 401));
  }

  const imagePath = place.image;

  try {
    place.creator.places.pull(place);
    await Place.findByIdAndDelete(placeId).exec();
    await place.creator.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError("field to delete place please try again", 500));
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(201).json({ message: "Place with the id " + placeId + " deleted successfuly" });
};

exports.createPlace = createPlace;
exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
