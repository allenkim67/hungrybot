var express      = require('express');
var app          = express();
var bodyParser   = require('body-parser');
var mongoose     = require('mongoose');
var cookieParser = require('cookie-parser');
var fs           = require('fs');
var fetch        = require('isomorphic-fetch');
var bot          = require('./util/bot');
//Routes
var menu         = require('./routes/menu');
var user         = require('./routes/user');
var session      = require('./routes/session');
var phone        = require('./routes/phone');
//Model
var User         = require('./model/User');
var Customer     = require('./model/Customer');

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/userDB');

//Middleware + View Engine
app.set('view engine', 'jade');
app.set('views', './src/views');
app.use(express.static('static'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routes
app.use('/menu', menu);
app.use('/user', user);
app.use('/phone', phone);
app.use('/session', session);

app.get('/', function(req, res){
	res.render('index', {username: req.cookies.username});
});


app.get('/stripe', function(req, res){
  User.findOne({username: req.cookies.username}, function(err, user){
    fetch('https://connect.stripe.com/oauth/token', {
      method: 'post',
      headers: {
        client_secret: process.env.STRIPE_SECRET_KEY,
        code: req.query.code,
        grant_type: 'authorization_code'
      }
    }).then(function(err, response) {
      user.stripeAccount = response.json().stripe_user_id;
      user.save(function(){
        res.redirect('/user/upgrade');
      });
    });
  });
});


app.listen(process.env.PORT || 3000);