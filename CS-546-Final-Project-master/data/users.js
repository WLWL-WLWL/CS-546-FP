const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const videogames = mongoCollections.videogames;
let { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const saltRounds = 12;

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

async function create(firstname, lastname, username, password , isAdmin = false) {
    checkFirstName(firstname);
    checkLastName(lastname);
    checkUserName(username);
    checkPassword(password);

    if (!firstname || !lastname || !username || !password)
        throw new Error("Missing input");

    if (!stringCheck(firstname) || !stringCheck(lastname) || !stringCheck(username) || !stringCheck(password))
        throw new Error("All strings must contain non-whitespace characters");

    const userCollection = await users();

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = {
        firstname: firstname,
        lastname: lastname,
        username: username.toLowerCase(),
        password: hashedPassword,
        numberOfVotes: 0,
        voteHistory: [],
        likedComments: [],
        dislikedComments: [],
        isAdmin : isAdmin
    };

    const info = await userCollection.insertOne(user);

    return ObjectIdToString(user);
}

async function getUser(id) {
    validateId(id);

    const userCollection = await users();

    const user = await userCollection.findOne({ _id: ObjectId(id) });
    if (user == null)
        throw new Error(`No item was found in User collection that match with id: ${id}`);

    return ObjectIdToString(user);
}

async function addGame(userId, gameId) {
    validateId(userId);
    validateId(gameId);

    const userCollection = await users();

    const user = await userCollection.findOne({ _id: ObjectId(userId) });
    if (user == null)
        throw new Error(`No item was found in User collection that match with id: ${userId}`);

    const game = await (await videogames()).findOne({ _id: ObjectId(gameId) });
    if (game == null)
        throw new Error(`No item was found in Video Game collection that match with id: ${gameId}`)

    const info = await userCollection.updateOne({ _id: user._id }, { $set: { voteHistory: user.voteHistory.concat([gameId]) } });

    return info;
}

async function likeComment(userId, commentId) {
    validateId(userId);
    validateId(commentId);

    const res = { modified: false, wasLiked: false, wasDisliked: false };

    const userCollection = await users();

    const user = await userCollection.findOne({ _id: ObjectId(userId) });
    if (user == null)
        throw new Error(`No item was found in User collection that match with id: ${userId}`);

    if (user.likedComments.findIndex(x => x === commentId) > -1)
        res.wasLiked = true;
    if (user.dislikedComments.findIndex(x => x === commentId) > -1)
        res.wasDisliked = true;

    res.wasLiked ? user.likedComments : user.likedComments.push(commentId);
    if(res.wasDisliked) user.dislikedComments.splice(user.dislikedComments.findIndex(x => x === commentId), 1);
    const info = await userCollection.updateOne({ _id: user._id }, {
        $set: {
            likedComments: user.likedComments,
            dislikedComments: user.dislikedComments
        }
    });

    res.modified = info.modifiedCount > 0;

    return res;
}

async function dislikeComment(userId, commentId) {
    validateId(userId);
    validateId(commentId);

    const userCollection = await users();

    const res = { modified: false, wasLiked: false, wasDisliked: false };

    const user = await userCollection.findOne({ _id: ObjectId(userId) });
    if (user == null)
        throw new Error(`No item was found in User collection that match with id: ${userId}`);

    if (user.likedComments.findIndex(x => x === commentId) > -1)
        res.wasLiked = true;
    if (user.dislikedComments.findIndex(x => x === commentId) > -1)
        res.wasDisliked = true;

    res.wasDisliked ? user.dislikedComments : user.dislikedComments.push(commentId);
    if(res.wasLiked) user.likedComments.splice(user.likedComments.findIndex(x => x === commentId), 1);
    const info = await userCollection.updateOne({ _id: user._id }, {
        $set: {
            dislikedComments: user.dislikedComments,
            likedComments: user.likedComments
        }
    });

    res.modified = info.modifiedCount > 0;

    return res;
}

async function removeLikeOrDislike(userId, commentId, like) {
    validateId(userId);
    validateId(commentId);

    const userCollection = await users();

    const user = await userCollection.findOne({ _id: ObjectId(userId) });
    if (user == null)
        throw new Error(`No item was found in User collection that match with id: ${userId}`);

    if (like == 1) {
        user.likedComments.splice(user.likedComments.findIndex(x => x === commentId), 1);
    } else if (like == -1) {
        user.dislikedComments.splice(user.dislikedComments.findIndex(x => x === commentId), 1);
    } else {
        throw new Error('Illegal input recieved');
    }

    const info = await userCollection.updateOne({ _id: user._id }, { $set: like == 1 ? { likedComments: user.likedComments } : { dislikedComments: user.dislikedComments } });

    return info;

}

async function getUserLikeDislikeHistory(userId) {
    validateId(userId);

    const userCollection = await users();

    const user = await userCollection.findOne({ _id: ObjectId(userId) });
    if (user == null)
        throw new Error(`No item was found in User collection that match with id: ${userId}`);

    return {likedComments: user.likedComments, dislikedComments: user.dislikedComments};
}



////////fucntions for login and sign up///////


function checkUserName(str) {

    if (str.length == 0 || str.trim().length == 0) throw "Username cannot be empty!";
    let strArr = str.toLowerCase().split('');
    for (let i = 0; i < strArr.length; i++) {
        if (strArr[i] === ' ') throw "Username cannot contian space!";
    }
    let newStr = strArr.join('');
    for (let i = 0; i < newStr.length; i++) {
        if (!((newStr.charCodeAt(i) >= 97 && newStr.charCodeAt(i) <= 122) || (newStr.charAt(i) >= 0 && newStr.charAt(i) <= 9))) throw "Username must be alphanumeric characters!";
    }
    if (newStr.length < 4) throw "Username must be at least 4 characters long!";

}

function checkPassword(str) {
    if (str.length == 0 || str.trim().length == 0) throw "Password cannot be empty!";
    let strArr = str.split('');
    for (let i = 0; i < strArr.length; i++) {
        if (strArr[i] === ' ') throw "Password cannot contian space!";
    }
    let newStr = strArr.join('');
    if (newStr.length < 6) throw "Passsword must be at least 6 characters long!";
}

function checkLastName(str) {
    if (str.length == 0 || str.trim().length == 0) throw "Last name cannot be empty!";
    let strArr = str.toLowerCase().split('');
    for (let i = 0; i < strArr.length; i++) {
        if (strArr[i] === ' ') throw "Last name cannot contian space!";
    }
    let newStr = strArr.join('');
    for (let i = 0; i < newStr.length; i++) {
        if (!((newStr.charCodeAt(i) >= 97 && newStr.charCodeAt(i) <= 122))) throw "Last name must be characters!";
    }
}

function checkFirstName(str) {
    if (str.length == 0 || str.trim().length == 0) throw "First name cannot be empty!";
    let strArr = str.toLowerCase().split('');
    for (let i = 0; i < strArr.length; i++) {
        if (strArr[i] === ' ') throw "First name cannot contian space!";
    }
    let newStr = strArr.join('');
    for (let i = 0; i < newStr.length; i++) {
        if (!((newStr.charCodeAt(i) >= 97 && newStr.charCodeAt(i) <= 122))) throw "First name must be characters!";
    }
}

async function checkUser(username, password) {
    checkUserName(username);
    checkPassword(password);
    lowerUserName = username.toLowerCase();
    const usersCollection = await users();
    const findUserName = await usersCollection.findOne({ username: lowerUserName });
    if (findUserName === null) throw "Either the username or password is invalid";
    let compareToMatch = false;
    if (findUserName !== null) {
        hashedPassword = findUserName.password;
        compareToMatch = await bcrypt.compare(password, hashedPassword);
    }
    if (compareToMatch) {
        return `{authenticated: true}`;
    } else {
        throw "Either the username or password is invalid";
    }
}

async function getUserId(username) {
    if (!username) throw "Username cannot be empty!";
    const userCollection = await users();
    const userData = await userCollection.findOne({ username: username });
    userData._id = userData._id.toString();
    return userData._id;
}

async function checkDuplicateUsername(username){
    checkUserName(username);
    lowerUserName = username.toLowerCase();
    const usersCollection = await users();
    const findUserName = await usersCollection.findOne({ username: lowerUserName });
    if (findUserName != null){
        return `{UsernameDuplicate: true}`;
    }else{
        return `{UsernameDuplicate: false}`;
    }
}
module.exports = {
    create,
    getUser,
    addGame,
    likeComment,
    dislikeComment,
    removeLikeOrDislike,
    checkUserName,
    checkPassword,
  checkFirstName,
  checkLastName,
    checkUser,
    getUserId,
    getUserLikeDislikeHistory,
    checkDuplicateUsername
}