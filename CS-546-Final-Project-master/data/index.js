const ratingRoutes = require('./rating');
const users = require('./users');
const videogames = require('./videogames');
const comments = require('./comments');
module.exports = {
    ratings: ratingRoutes,
    users: users,
    videogames: videogames,
    comments: comments
}