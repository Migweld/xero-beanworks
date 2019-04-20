const mongoose = require("mongoose");

const phoneSchema = mongoose.Schema({
  PhoneType: String,
  PhoneNumber: String,
  PhoneAreaCode: String,
  PhoneCountryCode: String,
});

module.exports = phoneSchema;
