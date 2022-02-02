const ratingRoutes = require('./rating');
const users = require('./users');
const videogames = require('./videogames');
const mainRoutes = require('./main');
const constructor = (app) => {
    app.use('/', mainRoutes);
    app.use('/rating', ratingRoutes);
    app.use('/users', users);
    app.use('/videogames', videogames);
    app.use('*', (req, res) => {
        res.status(404).render('error/error', {error: "404: Page not found."});
    })
};

module.exports = constructor;