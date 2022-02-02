const express = require('express');
const session = require('express-session')

const app = express();
const static = express.static(__dirname + '/public');

const configRoutes = require('./routes');
const exphbs = require('express-handlebars');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
    name: "AuthCookie",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 3600000}
    })
);

app.use(function(req, res, next) {
    console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${req.session.user ? 'Authenticated' : 'Not Authenticated'})`);
    next();
});

app.use('/users', (req, res, next) => {
    // console.log(req.url);
    if (!req.session.user) {
        return res.redirect('/login');
    } else {
        return next();
    } 
});

app.use('/rating', (req, res, next) => {
    // console.log(req.url);
    if (!req.session.user) {
        return res.redirect('/login');
    } else {
        return next();
    } 
});

// Create screen middleware only letting admin users create games
app.use('/videogames/create', (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect('/');
    } else {
        return next();
    } 
});

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
  console.log('Your routes will be running on http://localhost:3000');
});