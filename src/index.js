require("dotenv").config({ path: "/usr/src/app/.env" });
const express = require("express");
const XeroClient = require("xero-node").AccountingAPIClient;

const Helpers = require("./helpers");

const app = express();
app.set("port", 3000);

// 'Session' setup
let requestToken = null;
let accessToken = null;

let client = new XeroClient({
  appType: "public",
  consumerKey: process.env.XERO_CONSUMER_KEY,
  consumerSecret: process.env.XERO_SECRET_KEY,
  callbackUrl: process.env.XERO_CALLBACK_URL || "http://localhost:3000/oauth",
});

//Routes
app.get("/", async function(req, res) {
  if (accessToken === null) {
    requestToken = await client.oauth1Client.getRequestToken();
    let authUrl = client.oauth1Client.buildAuthoriseUrl(requestToken);
    res.redirect(authUrl);
  } else {
    let vendors = await getVendors();
    let accounts = await getAccounts();
    let result = await processVendorAndAccounts({
      vendors: vendors,
      accounts: accounts,
    });
    res.send(result);
  }
});

app.get("/oauth", async function(req, res) {
  let verifier = req.query.oauth_verifier;
  accessToken = await client.oauth1Client.swapRequestTokenforAccessToken(
    requestToken,
    verifier
  );
  res.redirect("/");
});

async function processVendorAndAccounts(data) {
  let newAccounts = [];
  let newVendors = [];

  let toStore = await Helpers.removeDuplicatesAndNonSuppliers(data);

  if (toStore.vendors.length > 0) {
    newVendors = await Helpers.saveVendors(toStore.vendors);
  } else {
    newVendors.push("No new vendors to store");
  }

  if (toStore.accounts.length > 0) {
    newAccounts = await Helpers.saveAccounts(toStore.accounts);
  } else {
    newAccounts.push("No new accounts to store");
  }

  return { vendors: newVendors, accounts: newAccounts };
}

async function getVendors() {
  return await client.contacts.get();
}

async function getAccounts() {
  return await client.accounts.get();
}

app.listen(app.get("port"), function() {
  console.log("App listening on http://localhost:3000");
});
