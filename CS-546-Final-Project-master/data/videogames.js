const mongoCollections = require('../config/mongoCollections');
const videogames = mongoCollections.videogames;
let { ObjectId } = require('mongodb');

function ObjectIdToString(obj) {
    if (typeof obj !== 'object' || !ObjectId.isValid(obj._id))
        throw new Error('Object passed in needs to have a valid _id field');

    obj._id = obj._id.toString();

    return obj;
}

function validateId(id) {
    if (!id || typeof id !== 'string' || !stringCheck(id) || !ObjectId.isValid(id))
        throw new Error('id must be a valid ObjectId string');
}

function stringCheck(str) {
    return typeof str === 'string' && str.length > 0 && str.replace(/\s/g, "").length > 0;
}

async function create(name, releaseDate, developer, genre, price, boxart) {
    if (!name || !releaseDate || !developer || !genre || !price || !boxart)
        throw new Error("Missing input");

    if (!stringCheck(name) || !stringCheck(releaseDate) || !stringCheck(developer) || !stringCheck(genre) || !stringCheck(price) || !stringCheck(boxart))
        throw new Error("All strings must contain non-whitespace characters");

    const gameCollection = await videogames();

    const game = {
        name: name,
        releaseDate: releaseDate,
        developer: developer,
        genre: genre,
        price: price,
        boxart: boxart,
        totalVotes: 0,
        averageUserRating: 0,
        comments: []
    };

    const info = await gameCollection.insertOne(game);

    return ObjectIdToString(game);
}

async function getGame(id) {
    validateId(id);

    const gameCollection = await videogames();

    const game = await gameCollection.findOne({ _id: ObjectId(id) });
    if (game == null)
        throw new Error(`No item was found in Game collection that match with id: ${id}`);

    return ObjectIdToString(game);
}

async function getAllVideoGames() {
    const videogamesCollection = await videogames();
    const videogamesList = await videogamesCollection.find({}).toArray();
    for (let i of videogamesList) {
        i._id = i._id.toString();
    }
    return videogamesList;
}

module.exports = { create, getGame, getAllVideoGames }