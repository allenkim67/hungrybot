var axios = require('axios');

axios.post('https://connect.stripe.com/oauth/token', {
      client_secret: process.env.STRIPE_SECRET_KEY,
      code: 'ac_7K9uxugrOYMbZrJxnEBEHZRHTrloi1Bi',
      grant_type: 'authorization_code'
    }).then(function(response) {
	console.log(response);
    }).catch(function(err) {console.log(err)});


