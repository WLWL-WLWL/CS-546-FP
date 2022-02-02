const mongoCollections = require('../config/mongoCollections');
const bcrypt = require("bcrypt");
const salt = 10;
const videogames = mongoCollections.videogames;
const users = mongoCollections.users;
let { ObjectId } = require('mongodb');

function stringCheck(str) {
    return typeof str === 'string' && str.length > 0 && str.replace(/\s/g, "").length > 0;
}

function validateId(id) {
    if(!id || typeof id !== 'string' || !stringCheck(id) || !ObjectId.isValid(id))
        throw new Error('id must be a valid ObjectId string');
}

function ObjectIdToString(obj) {
    if(typeof obj !== 'object' || !ObjectId.isValid(obj._id))
        throw new Error('Object passed in needs to have a valid _id field');

    obj._id = obj._id.toString();

    return obj;
}

async function getRandomGame(id) {
    // id is an optional input, if provided, it will exclude the game with the given id
    const videogamesCollection = await videogames();
    const allGames = await videogamesCollection.find({}).toArray();
    const randomGame = allGames[Math.floor(Math.random() * allGames.length)];
    if(id != undefined)
        id = id.toString();
    if(randomGame._id.toString() == id)
        return getRandomGame(id);
    
    return randomGame;
}

async function addRating(id, rating){
    validateId(id);
    const objId = ObjectId(id);

    const gameCollection = await videogames();

    let game = await gameCollection.findOne({_id: objId});
    if(game == null)
        throw new Error(`No item was found in User collection that match with id: ${id}`);
    
    let newRating = (game.totalVotes * game.averageUserRating + rating) / (game.totalVotes + 1);
    let str = newRating.toFixed(2);
    newRating = parseFloat(str);

    await gameCollection.updateOne({_id: objId}, {$set: {averageUserRating: newRating, totalVotes: game.totalVotes+1}});
    game = await gameCollection.findOne({_id: objId});

    return ObjectIdToString(game);
}

async function addRatingToUser(username, gameId){
    const userCollection = await users();
    let user = await userCollection.findOne({username: username.toLowerCase()});
    if(user == null)
        throw new Error(`No item was found in User collection that match with username: ${username}`);

    user.voteHistory.push(gameId);

    await userCollection.updateOne({username: username}, {$set: {numberOfVotes: user.numberOfVotes+1, voteHistory: user.voteHistory}});
    user = await userCollection.findOne({username: username});

    return ObjectIdToString(user);    
}

module.exports = {
    getRandomGame,
    addRating,
    addRatingToUser
}