var express      = require('express');
var app          = express();
var bodyParser   = require('body-parser');
var mongoose     = require('mongoose');
var bcrypt       = require('bcrypt');
var jwt          = require('json-web-token');
var cookieParser = require('cookie-parser');
var User         = require('./model/User');

mongoose.connect('mongodb://localhost/userDB');

//Middleware + View Engine
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res){
	res.render('index', {username: req.cookies.username});
});

app.get('/new', function(req, res){
	res.render('new');
});

app.get('/logout', function(req, res){
	res.clearCookie('username');
	res.redirect('/');
});

app.post('/login', function(req, res){
	console.log(req.body);
	User.findOne(req.body, function(err, user){
		res.cookie('username', user.username);
		res.redirect('/');
	});
});

app.post('/create', function(req, res){
	User.create(req.body, function(err, user){
		res.cookie('username', user.username); //send response to browser and tell browser to store a cookie called username
		res.redirect('/');
	});
});

app.listen(process.env.PORT || 3000);