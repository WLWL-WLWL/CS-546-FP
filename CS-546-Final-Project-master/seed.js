const users = require('./data/users');
const games = require('./data/videogames');
const comments = require('./data/comments');

module.exports = {
    seedFunction: async () => {
        const info = await users.addGame('61a7c3841d6ce1017136a8ba', '61a7c3841d6ce1017136a8bb');
    }
}