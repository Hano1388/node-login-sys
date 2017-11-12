const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/book-me');
// const db = mongoose.connection;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/bookme', {
  useMongoClient: true
})

const routes = require('./routes/index');
const users = require('./routes/users');

// Init App
const app = express();

// View Engine
app.set('views', path.join(__dirname, 'views/layouts')); // in this line we are telling the system we want a folder called 'views' to handle the views
app.engine('handlebars', exphbs({ defaultLayout: 'layout' })); // here we are setting handlebars as the 'app.engine'  and we also saying default layout file we want it to be called layout
app.set('view engine', 'handlebars'); // here we are setting application 'view engine' to 'handlebars'

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public'))); // that's where we put things like, css, images, libraries, ...etc

// Express Session Middleware
app.use(session({
  secret: 'secret', // secret can be whatever you like
  saveUninitialized: true, //
  resave: true
}));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator Middleware. below code taken from the github page. github.com/ctavan/express-validator
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    var namespace = param.split('.')
      , root      = namespace.shift()
      , formParam = root;

      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
  }
}));

// Connect flash Middleware
app.use(flash());

// setting some global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg'); // when we create global variable, we use 'res.locals.' then we write the name of the variable
  res.locals.error_msg   = req.flash('error_msg');
  res.locals.error = req.flash('error'); // the reason we have this here is because 'passport' sets its own flash messages
  // changing menu according to user status
  res.locals.user = req.user || null;
  next();
});



// Middlewares for our route files
app.use('/', routes);
app.use('/users', users);

// Set Port
app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), () => {
  console.log('Server started on port ' + app.get('port'));
});
// const PORT = 3333;
// app.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
// });
