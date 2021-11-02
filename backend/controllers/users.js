const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password").exec();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Field to find users please try again later", 500));
  }

  res.status(200).json(users);
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  let loginUser;
  try {
    loginUser = await User.findOne({ email: email }).exec();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Field to login please try again later1", 500));
  }

  if (!loginUser) {
    return next(new HttpError("incorrect email/password", 403));
  }
  let isValidPassword;
  try {
    isValidPassword = bcryptjs.compare(password, loginUser.password);
  } catch (error) {
    console.log(error);
    return next(new HttpError("Field to login please try again later2", 500));
  }

  if (!isValidPassword) {
    return next(new HttpError("incorrect email/password", 403));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: loginUser._id, email: loginUser.email },
      process.env.JWT_PRIVATE_KEY,
      {
        expiresIn: "2h",
      }
    );
  } catch (error) {
    console.log(error);
    return next(new HttpError("Field to login please try again later3", 500));
  }

  res.status(201).json({ userId: loginUser._id, email: loginUser.email, token: token });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    return next(new HttpError("Signing up failed, please try again later.", 500));
  }

  if (existingUser) {
    const error = new HttpError("User exists already, please login instead.", 422);
    return next(error);
  }
  let hashedPassword = await bcryptjs.hash(password, 12);

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Signing up failed, please try again later.", 500));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser._id, email: createdUser.email },
      process.env.JWT_PRIVATE_KEY,
      { expiresIn: "2h" }
    );
  } catch (error) {
    console.log(error);
    return next(new HttpError("Field to login please try again later", 500));
  }

  res.status(201).json({ userId: createdUser._id, email: createdUser.email, token: token });
};
exports.getUsers = getUsers;
exports.login = login;
exports.singup = signup;
