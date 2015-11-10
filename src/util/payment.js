var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

module.exports.makePaymentWithCardInfo = function(amount, customerId, user) {
  console.log('THIS IS THE FEE', Math.ceil(amount * user.appFee));
  stripe.tokens.create({customer: customerId}, {stripe_account: user.stripeAccount}, function(err, token) {
    console.log('THIS IS THE FEE', Math.ceil(amount * user.appFee));
    stripe.charges.create({
      amount: amount,
      currency: "usd",
      source: token.id,
      application_fee: Math.ceil(amount * user.appFee)
    }, {stripe_account: user.stripeAccount}, function(err, charge) { console.log(err, charge); });
  });
};