const express = require('express');
const router = express.Router();
const data = require('../data');
const games = data.videogames;
const ratings = data.ratings;

function type_checker(item, type, errString, objType) {
    if (item == undefined || typeof(item) != type || item.length == 0) throw errString;
    if (type == "string") {
        if (!/\S/.test(item)) throw errString;
    }
    if (objType == "array") {
        if (!Array.isArray(item) || item.length == 0) throw errString;
    }
}

router.get('/', async(req, res) => {
    try {
        if (req.session.leftGame != undefined) {
            const leftGame = await games.getGame(req.session.leftGame);
            const rightGame = await games.getGame(req.session.rightGame);
            req.session.leftGame = leftGame._id;
            req.session.rightGame = rightGame._id;
            res.render('ratings/rating', {
                id1: leftGame._id,
                name1: leftGame.name,
                image1: leftGame.boxart,
                release1: leftGame.releaseDate,
                genre1: leftGame.genre,
                price1: leftGame.price,
                developer1: leftGame.developer,
                id2: rightGame._id,
                name2: rightGame.name,
                image2: rightGame.boxart,
                release2: rightGame.releaseDate,
                genre2: rightGame.genre,
                price2: rightGame.price,
                developer2: rightGame.developer,
                userLoggedIn: req.session.user !== undefined,
                userId: req.session.user?.userId,
                isAdmin: req.session.user?.isAdmin,
            });
        } else {
            const newLeft = await ratings.getRandomGame();
            const newRight = await ratings.getRandomGame(newLeft._id);
            req.session.leftGame = newLeft._id;
            req.session.rightGame = newRight._id;
            res.render('ratings/rating', {
                id1: newLeft._id,
                name1: newLeft.name,
                image1: newLeft.boxart,
                release1: newLeft.releaseDate,
                genre1: newLeft.genre,
                price1: newLeft.price,
                developer1: newLeft.developer,
                id2: newRight._id,
                name2: newRight.name,
                image2: newRight.boxart,
                release2: newRight.releaseDate,
                genre2: newRight.genre,
                price2: newRight.price,
                developer2: newRight.developer,
                userLoggedIn: req.session.user !== undefined,
                userId: req.session.user?.userId,
                isAdmin: req.session.user?.isAdmin
            });
        }
    } catch (e) {
        console.log(e);
        return;
    }
});

router.post('/reset', async(req, res) => {
    try {
        await ratings.addRatingToUser(req.session.user.username.toLowerCase(), req.body.side == 'left' ? req.session.leftGame : req.session.rightGame);
        if (req.body.side == 'left') {
            await ratings.addRating(req.session.leftGame, 1);
            await ratings.addRating(req.session.rightGame, 0);
        } else {
            await ratings.addRating(req.session.rightGame, 1);
            await ratings.addRating(req.session.leftGame, 0);
        }
        const newLeft = await ratings.getRandomGame();
        const newRight = await ratings.getRandomGame(newLeft._id);

        req.session.leftGame = newLeft._id.toString();
        req.session.rightGame = newRight._id.toString();

        const resetData = {
            id1: newLeft._id,
            name1: newLeft.name,
            image1: newLeft.boxart,
            release1: newLeft.releaseDate,
            genre1: newLeft.genre,
            price1: newLeft.price,
            developer1: newLeft.developer,
            id2: newRight._id,
            name2: newRight.name,
            image2: newRight.boxart,
            release2: newRight.releaseDate,
            genre2: newRight.genre,
            price2: newRight.price,
            developer2: newRight.developer,
        };
        res.json(resetData);
    } catch (e) {
        res.json(null);
        console.log(e);
        return;
    }
});

module.exports = router;