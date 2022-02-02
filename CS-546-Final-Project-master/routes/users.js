const express = require('express');
const { users } = require('../data');
const { videogames } = require('../data');
const router = express.Router();

router.get('/:id', async (req, res) => {
    if(!req.params || !req.params.id) {
        res.status(500).render('error/error.handlebars', {error: 'No user id passed in'});
        return;
    }

    // Make call from data.users to get user data with id
    var userData = undefined;
    var gameList = [];
    var genreStats = {};
    try {
        userData = await users.getUser(req.params.id);
        for(var gameId of userData.voteHistory) {
            const game = await videogames.getGame(gameId);
            gameList.push(game.name);
            game.genre in genreStats ? genreStats[game.genre]++ : genreStats[game.genre] = 1;
        }
    } catch(e) {
        res.status(500).render('error/error.handlebars', {error: `${e}`});
        return;
    }

    Object.keys(genreStats).forEach(g => genreStats[g] = ((genreStats[g] / userData.numberOfVotes) * 100).toFixed(2));

    res.render('users/userPage.handlebars', {userData: userData, gameList: gameList, genreStats: genreStats, userId: req.session.user?.userId, 
            userLoggedIn: req.session.user !== undefined, isAdmin: req.session.user?.isAdmin});
});

router.get('/:id/comment', async(req, res) => {
    if(!req.params || !req.params.id) {
        res.status(400).json({error: 'No user id passed in'});
        return;
    }

    try {
        const userLikeDislikeHistory = await users.getUserLikeDislikeHistory(req.params.id);
        res.json(userLikeDislikeHistory);
    } catch (e){
        res.status(500).json({error: `${e}`});
    }
})

router.post('/:id/comment/:commentId', async(req, res) => {
    if(!req.params || !req.params.id || !req.params.commentId) {
        res.status(400).json({error: 'No user id passed in'});
        return;
    }

    if(!req.body) {
        res.status(400).json({error: 'No data in request body'});
        return;
    }
    if(!req.body.like) {
        res.status(400).json({error: 'No like data in request body'});
        return;
    }
    if(!req.body.operation) {
        res.status(400).json({error: 'No operation in request body'});
        return;
    }

    try {
        if(req.body.operation === 'addData') {
            if(req.body.like == 1) {   // Used liked comment
                const updateInfo = await users.likeComment(req.params.id, req.params.commentId);
                res.json(updateInfo);
            } else if(req.body.like == -1) {   // Used disliked comment
                const updateInfo = await users.dislikeComment(req.params.id, req.params.commentId);
                res.json(updateInfo);
            } else {
                throw new Error('Innaprorpiate data recieved');
            }
        } else if(req.body.operation === 'removeData') {
            res.json(await users.removeLikeOrDislike(req.params.id, req.params.commentId, req.body.like));
        }
    } catch(e) {
        res.status(500).json({error: `${e}`});
        return;
    }
});

module.exports = router;