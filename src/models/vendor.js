const mongoose = require("mongoose");
const addressSchema = require("./address");
const phoneSchema = require("./phone");

const vendorSchema = mongoose.Schema({
  ContactID: { type: String, index: { unique: true, dropDups: true } },
  ContactNumber: String,
  ContactStatus: String,
  Name: String,
  FirstName: String,
  LastName: String,
  EmailAddress: String,
  Addresses: [addressSchema],
  Phones: [phoneSchema],
  UpdatedDateUTC: String,
  IsSupplier: Boolean,
  IsCustomer: Boolean,
  HasAttachments: Boolean,
  HasValidationErrors: Boolean,
});

module.exports = mongoose.model("Vendor", vendorSchema);
