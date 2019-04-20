const mongoose = require("mongoose");

const accountSchema = mongoose.Schema({
  AccountID: { type: String, index: { unique: true, dropDups: true } },
  Code: String,
  Name: String,
  Status: String,
  Type: String,
  TaxType: String,
  Class: String,
  EnablePaymentsToAccount: Boolean,
  ShowInExpenseClaims: Boolean,
  BankAccountNumber: String,
  BankAccountType: String,
  CurrencyCode: String,
  ReportingCode: String,
  ReportingCodeName: String,
  HasAttachments: Boolean,
  UpdatedDateUTC: String,
});

module.exports = mongoose.model("Account", accountSchema);
