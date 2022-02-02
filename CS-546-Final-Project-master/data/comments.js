const mongoCollections = require('../config/mongoCollections');
const videogames = mongoCollections.videogames;
let { ObjectId } = require('mongodb');

function ObjectIdToString(obj) {
    if(typeof obj !== 'object' || !ObjectId.isValid(obj._id))
        throw new Error('Object passed in needs to have a valid _id field');

    obj._id = obj._id.toString();

    return obj;
}

function validateId(id) {
    if(!id || typeof id !== 'string' || !stringCheck(id) || !ObjectId.isValid(id))
        throw new Error('id must be a valid ObjectId string');
}

function stringCheck(str) {
    return typeof str === 'string' && str.length > 0 && str.replace(/\s/g, "").length > 0;
}

async function create(gameId, title, reviewer, date, comment) {
    if(!gameId, !title || !reviewer || !date || !comment)
        throw new Error("Missing input");

    if(!stringCheck(gameId) || !stringCheck(title) || !stringCheck(reviewer) || !stringCheck(date) || !stringCheck(comment))
        throw new Error("All strings must contain non-whitespace characters");

    const gameCollection = await videogames();
    
    const commentObj = {
        _id: ObjectId(),
        title: title,
        reviewer: reviewer,
        date: date,
        comment: comment,
        likes: 0,
        dislikes: 0
    };

    const game = await gameCollection.findOne({_id: ObjectId(gameId)});
    game.comments = game.comments.concat([commentObj]);
    const info = await gameCollection.updateOne({_id: game._id}, {$set: {comments: game.comments}});

    return ObjectIdToString(commentObj);
}

async function addLikeDislike(gameId, commentId, like) {
    validateId(gameId);
    validateId(commentId);

    // like can be 1 (user liked) or -1 (user disliked)
    
    if(like != 1 && like != -1) {
        throw new Error('like must be 1 or -1');
    }

    const gameCollection = await videogames();
    const game = await gameCollection.findOne({_id: ObjectId(gameId)});

    const res = {likes: 0, dislikes: 0};

    for(var comment of game.comments) {
        if(comment._id == commentId) {
            if(like == 1) {
                comment.likes += 1
            } else {
                comment.dislikes += 1
            }
            res.likes = comment.likes;
            res.dislikes = comment.dislikes;

            break;
        }
    }

    const info = await gameCollection.updateOne({_id: game._id}, {$set: {comments: game.comments}});
    
    return res;
}

async function removeLikeDislike(gameId, commentId, like) {
    validateId(gameId);
    validateId(commentId);

    // like can be 1 (user liked) or -1 (user disliked)
    
    if(like != 1 && like != -1) {
        throw new Error('like must be 1 or -1');
    }

    const gameCollection = await videogames();
    const game = await gameCollection.findOne({_id: ObjectId(gameId)});

    const res = {likes: 0, dislikes: 0};

    for(var comment of game.comments) {
        if(comment._id == commentId) {
            if(like == 1 && comment.likes > 0) {
                comment.likes -= 1
            } else if(comment.dislikes > 0){
                comment.dislikes -= 1
            }

            res.likes = comment.likes;
            res.dislikes = comment.dislikes;
            break;
        }
    }

    const info = await gameCollection.updateOne({_id: game._id}, {$set: {comments: game.comments}});
    
    return res;
}

module.exports = {create, addLikeDislike, removeLikeDislike}