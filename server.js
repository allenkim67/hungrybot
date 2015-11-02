var express      = require('express');
var app          = express();
var bodyParser   = require('body-parser');
var mongoose     = require('mongoose');
var jwt          = require('json-web-token');
var cookieParser = require('cookie-parser');
//Routes
var menu         = require('./routes/menu');
var user         = require('./routes/user');
var session      = require('./routes/session');

mongoose.connect('mongodb://localhost/userDB');

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






app.listen(process.env.PORT || 3000);