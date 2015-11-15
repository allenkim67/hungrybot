var stripe    = require("stripe")(process.env.STRIPE_SECRET_KEY);
var promisify = require("es6-promisify");

var createStripeToken    = promisify(stripe.tokens.create);
var createStripeCustomer = promisify(stripe.customers.create);
var createStripeCharge   = promisify(stripe.charges.create);

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
  mongoCustomer.save();

  return stripeCustomer.id;
};

module.exports.makePaymentWithCardInfo = async function(amount, customerId, user) {
  var token = await createStripeToken({customer: customerId}, {stripe_account: user.stripeAccount});
  return await createStripeCharge({
      amount: amount,
      currency: "usd",
      source: token.id,
      application_fee: Math.ceil(amount * user.appFee)
    }, {
      stripe_account: user.stripeAccount
    });
};