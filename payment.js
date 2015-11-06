var stripe = require("stripe")("sk_test_6T5wjvqShyQeMPhuaSNNZaKv");

module.exports.createCustomerId = function(params, mongoCustomer, callback) {
  var card = {
    "number": params.ccNumber,
    "exp_month": params.ccExpMonth,
    "exp_year": params.ccExpYear,
    "cvc": params.ccCvc
  };

  stripe.tokens.create({card: card}, function(err, token) {
    stripe.customers.create({source: token.id}, function(err, stripeCustomer) {
      mongoCustomer.stripeId = stripeCustomer.id;
      mongoCustomer.save();
      callback(stripeCustomer.id);
    });
  });
};

module.exports.makePaymentWithCardInfo = function(amount, customerId, stripeAccount) {
  stripe.tokens.create({customer: customerId}, {stripe_account: stripeAccount}, function(err, token) {
    stripe.charges.create({ amount: amount, currency: "usd", source: token.id }, {stripe_account: stripeAccount});
  });
};