require("dotenv").config();
const mongoose = require("mongoose");
const Vendor = require("./models/vendor");
const Account = require("./models/account");

let db = null;

//DB Setup
try {
  mongoose.connect("mongodb://db:27017/xero-beanworks", {
    useNewUrlParser: true,
  });
  db = mongoose.connection;
  console.log(
    "Started connection on (mongodb://db:27017/xero-beanworks), waiting for it to open..."
  );
} catch (err) {
  console.log(
    "Setting up failed to connect to (mongodb://db:27017/xero-beanworks)," +
      err.message
  );
}

async function getDuplicateAccounts(accounts, accountIds) {
  let accountsToStore = [];

  await Account.find({ AccountID: { $in: accountIds } }, function(
    error,
    result
  ) {
    if (result.length < 1) {
      accountsToStore = accounts;
    } else {
      accountsToStore = accounts.filter(function(account) {
        return result.findIndex(x => x.AccountID === account.AccountID) === -1;
      });
    }
  });
  return accountsToStore;
}

async function getDuplicateVendors(vendors, vendorIds) {
  let vendorsToStore = [];
  await Vendor.find({ ContactID: { $in: vendorIds } }, function(error, result) {
    if (result.length < 1) {
      vendorsToStore = vendors.filter(function(vendor) {
        return vendor.IsSupplier === true;
      });
    } else {
      vendorsToStore = vendors.filter(function(vendor) {
        return (
          result.findIndex(x => x.ContactID === vendor.ContactID) === -1 &&
          vendor.IsSupplier === true
        );
      });
    }
  });
  return vendorsToStore;
}

async function removeDuplicatesAndNonSuppliers(data) {
  // Get the IDs for suppliers out of the returned API objects to make an array to check whereIn on the DB
  let vendorIds = data.vendors.Contacts.map(function(vendor) {
    return vendor.ContactID;
  });

  // Same for all accounts
  let accountIds = data.accounts.Accounts.map(function(account) {
    return account.AccountID;
  });

  let accountsToStore = await getDuplicateAccounts(
    data.accounts.Accounts,
    accountIds
  );

  let vendorsToStore = await getDuplicateVendors(
    data.vendors.Contacts,
    vendorIds
  );

  return { vendors: vendorsToStore, accounts: accountsToStore };
}

function saveVendors(data) {
  let vendors = data.map(function(vendor) {
    return {
      ContactID: vendor.ContactID,
      ContactNumber: vendor.ContactNumber,
      ContactStatus: vendor.ContactStatus,
      Name: vendor.Name,
      FirstName: vendor.FirstName,
      LastName: vendor.LastName,
      EmailAddress: vendor.EmailAddress,
      Addresses:
        typeof vendor.Addresses !== "undefined"
          ? vendor.Addresses.map(function(address) {
              return { AddressType: address.AddressType };
            })
          : null,
      Phones:
        typeof vendor.Phones !== "undefined"
          ? vendor.Phones.map(function(phone) {
              return { PhoneType: phone.PhoneType };
            })
          : null,
      UpdatedDateUTC: vendor.UpdatedDateUTC,
      IsSupplier: vendor.IsSupplier,
      IsCustomer: vendor.IsCustomer,
      HasAttachments: vendor.HasAttachments,
      HasValidationErrors: vendor.HasValidationErrors,
    };
  });

  let result = Vendor.insertMany(vendors)
    .then(function(x) {
      return x;
    })
    .catch(function(error) {
      console.log(error);
    });

  return result;
}

function saveAccounts(data) {
  let accounts = data.map(function(account) {
    return {
      AccountID: account.AccountID,
      Code: account.Code,
      Name: account.Name,
      Status: account.Status,
      Type: account.Type,
      TaxType: account.TaxType,
      Class: account.Class,
      EnablePaymentsToAccount: account.EnablePaymentsToAccount,
      ShowInExpenseClaims: account.ShowInExpenseClaims,
      BankAccountNumber: account.BankAccountNumber,
      BankAccountType: account.BankAccountType,
      CurrencyCode: account.CurrencyCode,
      ReportingCode: account.ReportingCode,
      ReportingCodeName: account.ReportingCodeName,
      HasAttachments: account.HasAttachments,
      UpdatedDateUTC: account.UpdatedDateUTC,
    };
  });

  let result = Account.insertMany(accounts)
    .then(function(x) {
      return x;
    })
    .catch(function(error) {
      console.log(error);
    });

  return result;
}

module.exports = {
  removeDuplicatesAndNonSuppliers: removeDuplicatesAndNonSuppliers,
  getDuplicateAccounts: getDuplicateAccounts,
  getDuplicateVendors: getDuplicateVendors,
  saveAccounts: saveAccounts,
  saveVendors: saveVendors,
};
