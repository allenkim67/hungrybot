var stripe    = require("stripe")(process.env.STRIPE_SECRET_KEY);
var promisify = require("es6-promisify");

var createStripeToken    = promisify(stripe.tokens.create.bind(stripe.tokens));
var createStripeCustomer = promisify(stripe.customers.create.bind(stripe.customers));
var createStripeCharge   = promisify(stripe.charges.create.bind(stripe.charges));

module.exports.createCustomerId = async function(params, mongoCustomer) {
  var card = {
    "number": params.ccNumber,
    "exp_month": params.ccExpMonth,
    "exp_year": params.ccExpYear,
    "cvc": params.ccCvc
  };
  var token = await createStripeToken({card: card});
  var stripeCustomer = await createStripeCustomer({source: token.id});

  mongoCustomer.stripeId = stripeCustomer.id;
  mongoCustomer.cc = params.ccNumber.slice(-4);
  mongoCustomer.save();

  return stripeCustomer.id;
};

module.exports.saveStripeCustomer = async function(customerInfo, mongoCustomer) {
  var stripeCustomer = await createStripeCustomer({source: customerInfo.stripeToken});

  mongoCustomer.stripeId = stripeCustomer.id;
  mongoCustomer.address = {
    street1: customerInfo.stripeShippingAddressLine1,
    city: customerInfo.stripeShippingCity,
    zip: customerInfo.stripeShippingZip
  };

  mongoCustomer.cc = stripeCustomer.sources.data.last4;
  mongoCustomer.save();

  return stripeCustomer.id;
};

module.exports.makePaymentWithCustomerId = async function(amount, customerId, business) {
  var token = await createStripeToken({customer: customerId}, {stripe_account: business.stripeAccount});
  return await createStripeCharge({
    amount: amount,
    currency: "usd",
    source: token.id,
    application_fee: Math.ceil(amount * business.appFee)
  }, {
    stripe_account: business.stripeAccount
  });
};