// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express'); //gets express 
var methodOR = require('method-override')  
var app      = express();
var port     = process.env.PORT || 9000; //port is whatever th
const MongoClient = require('mongodb').MongoClient //helps talk to databse
var mongoose = require('mongoose'); //how we really talk to our database
var passport = require('passport'); //authentication 
var flash    = require('connect-flash'); //used for error messages 
var moment = require('moment')

var morgan       = require('morgan'); //how we are doing our logging of opersyion on sites
var cookieParser = require('cookie-parser'); //enables us to look at the logged in session, 
var bodyParser   = require('body-parser'); //enables us to look at stuff that comes along with forms
var session      = require('express-session');

var configDB = require('./config/database.js');

var db

// configuration ===============================================================
mongoose.connect(configDB.url, (err, database) => {
  if (err) return console.log(err)
  db = database
  require('./app/routes.js')(app, passport, db, moment);
}); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(methodOR('_method'))

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'rcbootcamp2021b', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// launch ======================================================================
app.listen(port, "0.0.0.0");
console.log('The magic happens on port ' + port);
