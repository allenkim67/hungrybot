var express          = require('express');
var app              = express();
var server           = require('http').Server(app);
var bodyParser       = require('body-parser');
var mongoose         = require('mongoose');
var cookieParser     = require('cookie-parser');
var compress         = require('compression');
var fs               = require('fs');
var path             = require('path');
var jwt              = require('jsonwebtoken');
var axios            = require('axios');
var socket           = require('./util/socket');
var authMiddleware   = require('./authMiddleware');
var customValidators = require('./validators').customValidators;
var expressValidator = require('express-validator');
//Routes
var menu             = require('./routes/menu');
var business         = require('./routes/business');
var session          = require('./routes/session');
var phone            = require('./routes/phone');
var bot              = require('./routes/bot');
var subscriber       = require('./routes/subscriber');
var orders           = require('./routes/orders');
var payment          = require('./routes/payment');
//Model
var Business         = require('./model/Business');
var Customer         = require('./model/Customer');
var Menu             = require('./model/Menu');

socket.init(server);
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/hungrybot');

//Middleware + View Engine
app.set('view engine', 'jade');
app.set('views', './src/server/views');
app.use(compress());
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
app.use('/subscriber', subscriber);
app.use('/orders', orders);
app.use('/payment', payment);

app.get('/', authMiddleware.noRedirect, function(req, res) {
  if (req.session) {
    res.render('home');
  } else {
    res.sendFile('landing.html', {root: path.join(__dirname, '../../static')});
  }
});

app.get('/stripe', authMiddleware, function(req, res){
  Business.findById(req.session._id, function(err, business){
    axios.post('https://connect.stripe.com/oauth/token', {
      client_secret: process.env.STRIPE_SECRET_KEY,
      code: req.query.code,
      grant_type: 'authorization_code'
    }).then(function(response) {
      business.stripeAccount = response.data.stripe_user_id;
      business.save(function(){
        res.redirect('/user/upgrade');
      });
    }).catch(function(err) {console.log(err.stack)});
  });
});

app.get('/momo', authMiddleware, async function(req, res) {
  try {
    var message = 'hi';
    var response = await axios.get('http://localhost:3000/query/' + req.session._id + '?message=' + message);
    res.send(response.data);
  } catch (err) {
    res.send(err.data);
  }
});

socket.io.on('connection', function(socket) {
  socket.on('sessionToken', function(sessionToken) {
    var sessionId = jwt.verify(sessionToken, process.env.JWT_SECRET_KEY)._id;
    socket.join(sessionId);
  })
});

process.on('unhandledRejection', function(reason, p) {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason.stack);
});

(async function() {
  try {
    server.listen(process.env.PORT || 3001, () => console.log('Server is listening.'));
  } catch (err) {
    console.log(err.stack);
  }
}());