const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
  AddressType: String,
  City: String,
  Region: String,
  PostalCode: String,
  Country: String,
});

module.exports = addressSchema;
