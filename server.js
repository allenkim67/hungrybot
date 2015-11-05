var express      = require('express');
var app          = express();
var bodyParser   = require('body-parser');
var mongoose     = require('mongoose');
var jwt          = require('json-web-token');
var cookieParser = require('cookie-parser');
var twilio       = require('twilio');
var fs           = require('fs');
var request      = require('superagent');
//Routes
var menu         = require('./routes/menu');
var user         = require('./routes/user');
var session      = require('./routes/session');
//Model
var User         = require('./model/User');

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/userDB');

//Middleware + View Engine
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routes
app.use('/menu', menu);
app.use('/user', user);
app.use('/session', session);

app.get('/', function(req, res){
	res.render('index', {username: req.cookies.username});
});

//SMS - Account Creation
app.post('/phone', function(req, res) {
  var twiml = new twilio.TwimlResponse();
  
  twiml.message(req.body.Body);
  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
});

app.get('/stripe', function(req, res){
  User.findOne({username: req.cookies.username}, function(err, user){
    request
      .post('https://connect.stripe.com/oauth/token')
      .send({client_secret: 'sk_test_6T5wjvqShyQeMPhuaSNNZaKv', code: req.query.code, grant_type: 'authorization_code'})
      .end(function(err, response) {
        user.stripeAccount = response.body.stripe_user_id;
        user.save(function(){
          res.redirect('/');
        });
      });
  });
});


app.listen(process.env.PORT || 3000);