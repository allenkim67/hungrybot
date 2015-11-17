var express          = require('express');
var app              = express();
var bodyParser       = require('body-parser');
var mongoose         = require('mongoose');
var cookieParser     = require('cookie-parser');
var fs               = require('fs');
var axios            = require('axios');
var authMiddleware   = require('./authMiddleware');
var customValidators = require('./validators').customValidators;
var expressValidator = require('express-validator');
//Routes
var menu             = require('./routes/menu');
var business         = require('./routes/business');
var session          = require('./routes/session');
var phone            = require('./routes/phone');
var bot              = require('./routes/bot');
//Model
var Business         = require('./model/Business');
var Customer         = require('./model/Customer');
var Menu             = require('./model/Menu');

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/hungrybot');

//Middleware + View Engine
app.set('view engine', 'jade');
app.set('views', './src/views');
app.use(express.static('static'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator({customValidators: customValidators}));

//Routes
app.use('/menu', menu);
app.use('/user', business);
app.use('/phone', phone);
app.use('/session', session);
app.use('/bot', bot);

app.get('/', authMiddleware, function(req, res){
	res.render('index', {name: req.session.name});
});

app.get('/stripe', function(req, res){
  Business.findById(req.cookies.session._id, function(err, business){
    axios.post('https://connect.stripe.com/oauth/token', {
      client_secret: process.env.STRIPE_SECRET_KEY,
      code: req.query.code,
      grant_type: 'authorization_code'
    }).then(function(response) {
      business.stripeAccount = response.data.stripe_user_id;
      business.save(function(){
        res.redirect('/user/upgrade');
      });
    });
  });
});

(async function() {
  try {
    app.listen(process.env.PORT || 3000);
  } catch (err) {
    console.log(err.stack);
  }
}());
