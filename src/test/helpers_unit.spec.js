const Helpers = require("../helpers");
const assert = require("assert");
let sinon = require("sinon");
require("sinon-mongoose");
const Account = require("../models/account");
const Vendor = require("../models/vendor");

describe("getDuplicateAccounts", function() {
  it("takes an array of account objects and an array of accountIds, filtering out any duplicates in the object array", async function() {
    // Array of accounts received from Xero
    let accounts = [{ AccountID: 1 }, { AccountID: 2 }, { AccountID: 3 }];

    // Mock our DB call
    const AccountMock = sinon.mock(Account);

    AccountMock.expects("find").yields(null, [
      { AccountID: 1 },
      { AccountID: 2 },
    ]);

    let result = await Helpers.getDuplicateAccounts(accounts, [1, 2, 3]);
    AccountMock.restore();

    assert.equal(result.length, 1);
    assert.equal(result[0].AccountID, 3);
  });

  it("returns the entire input array if no result is found in the DB", async function() {
    let accounts = [{ AccountID: 1 }, { AccountID: 2 }, { AccountID: 3 }];

    const AccountMock = sinon.mock(Account);

    AccountMock.expects("find").yields(null, []);

    let result = await Helpers.getDuplicateAccounts(accounts, [1, 2, 3]);
    AccountMock.restore();

    assert.equal(result.length, 3);
    assert.deepEqual(result, [
      { AccountID: 1 },
      { AccountID: 2 },
      { AccountID: 3 },
    ]);
  });
});

describe("getDuplicateVendors", function() {
  it("takes an array of vendor objects and an array of vendorIds, filtering out any duplicates and non-suppliers in the object array", async function() {
    // Array of accounts received from Xero
    let vendors = [
      { ContactID: 1, IsSupplier: true },
      { ContactID: 2, IsSupplier: true },
      { ContactID: 3, IsSupplier: false },
    ];

    // Mock our DB call
    const VendorMock = sinon.mock(Vendor);

    VendorMock.expects("find").yields(null, [{ ContactID: 2 }]);

    let result = await Helpers.getDuplicateVendors(vendors, [1, 2, 3]);
    VendorMock.restore();

    assert.equal(result.length, 1);
    assert.equal(result[0].ContactID, 1);
    assert.equal(result[0].IsSupplier, true);
  });

  it("returns the entire input array if no result is found in the DB, minus any non-suppliers", async function() {
    let vendors = [
      { ContactID: 1, IsSupplier: true },
      { ContactID: 2, IsSupplier: true },
      { ContactID: 3, IsSupplier: false },
    ];

    const VendorMock = sinon.mock(Vendor);

    VendorMock.expects("find").yields(null, []);

    let result = await Helpers.getDuplicateVendors(vendors, [1, 2, 3]);
    VendorMock.restore();

    assert.equal(result.length, 2);
    assert.deepEqual(result, [
      { ContactID: 1, IsSupplier: true },
      { ContactID: 2, IsSupplier: true },
    ]);
  });
});

describe("saveAccounts", function() {
  it("saves and returns an array of accounts to/from the DB", async function() {
    let accounts = [{ AccountID: 1 }, { AccountID: 2 }, { AccountID: 3 }];

    // Mock our DB call
    const AccountMock = sinon.mock(Account);

    AccountMock.expects("insertMany")
      .once()
      .resolves([{ AccountID: 1 }, { AccountID: 2 }, { AccountID: 3 }]);

    let result = await Helpers.saveAccounts(accounts);
    AccountMock.verify();
    AccountMock.restore();

    assert.deepEqual(result, [
      { AccountID: 1 },
      { AccountID: 2 },
      { AccountID: 3 },
    ]);
  });
});

describe("saveVendors", function() {
  it("saves and returns an array of vendors to/from the DB", async function() {
    let vendors = [{ ContactID: 1 }, { ContactID: 2 }, { ContactID: 3 }];

    // Mock our DB call
    const VendorMock = sinon.mock(Vendor);

    VendorMock.expects("insertMany")
      .once()
      .resolves([{ ContactID: 1 }, { ContactID: 2 }, { ContactID: 3 }]);

    let result = await Helpers.saveVendors(vendors);
    VendorMock.verify();
    VendorMock.restore();

    assert.deepEqual(result, [
      { ContactID: 1 },
      { ContactID: 2 },
      { ContactID: 3 },
    ]);
  });
});
