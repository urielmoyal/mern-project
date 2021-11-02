const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true, minlength: 6 },
  image: { type: String, require: true },
  places: [{ type: mongoose.Types.ObjectId, require: true, ref: "Place" }],
});

//make sure no email will entered twice
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
